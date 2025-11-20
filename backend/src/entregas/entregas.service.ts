import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Entregador, Prisma, type SolicitacoesEntregas } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { EntregasGateway } from "./entregas.gateway";
import { NotificacaoSolicitacao } from "./dto/notificacao-solicitacao.dto";

const RAIO_BUSCA_METROS = 1500;

@Injectable()
export class EntregasService {
  private readonly logger = new Logger(EntregasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entregasGateway: EntregasGateway
  ) {}

  @OnEvent("solicitacao.criada")
  async handleSolicitacaoCriada(solicitacao: SolicitacoesEntregas) {
    this.logger.log(
      `Ouvindo evento: solicitacao.criada (ID: ${solicitacao.id})`
    );

    try {
      const solicitacaoCompleta =
        await this.prisma.solicitacoesEntregas.findUnique({
          where: { id: solicitacao.id },
          select: {
            id: true,
            valor_entregador: true,
            distancia_m: true,
            item_retorno: true,
            descricao_item_retorno: true,
            observacao: true,
            cep: true,
            cidade: true,
            bairro: true,
            logradouro: true,
            numero: true,
            complemento: true,
            ponto_referencia: true,
            latitude: true,
            longitude: true,
            status: true,
            empresa: {
              select: {
                id: true,
                nome_empresa: true,
                cep: true,
                cidade: true,
                bairro: true,
                logradouro: true,
                numero: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        });

      if (!solicitacaoCompleta) {
        this.logger.error(
          `Solicitação ${solicitacao.id} não encontrada no banco para notificação.`
        );
        return;
      }

      if (
        !solicitacaoCompleta.empresa.latitude ||
        !solicitacaoCompleta.empresa.longitude
      ) {
        this.logger.error(
          `Empresa da solicitação ${solicitacao.id} sem coordenadas.`
        );
        return;
      }

      const entregadoresProximos = await this.buscarEntregadoresProximos(
        solicitacaoCompleta.empresa.longitude,
        solicitacaoCompleta.empresa.latitude
      );

      this.logger.log(
        `Encontrados ${entregadoresProximos.length} entregadores próximos.`
      );

      const notificacaoPayload: NotificacaoSolicitacao = {
        id: solicitacaoCompleta.id,
        valor_entregador: solicitacaoCompleta.valor_entregador,
        distancia_m: solicitacaoCompleta.distancia_m ?? 0,
        item_retorno: solicitacaoCompleta.item_retorno,
        descricao_item_retorno:
          solicitacaoCompleta.descricao_item_retorno ?? undefined,
        observacao: solicitacaoCompleta.observacao ?? undefined,
        cep: solicitacaoCompleta.cep,
        cidade: solicitacaoCompleta.cidade,
        bairro: solicitacaoCompleta.bairro,
        logradouro: solicitacaoCompleta.logradouro,
        numero: solicitacaoCompleta.numero,
        complemento: solicitacaoCompleta.complemento ?? undefined,
        ponto_referencia: solicitacaoCompleta.ponto_referencia ?? undefined,
        latitude: solicitacaoCompleta.latitude ?? 0,
        longitude: solicitacaoCompleta.longitude ?? 0,
        status: solicitacaoCompleta.status,
        empresa: {
          id: solicitacaoCompleta.empresa.id,
          nome_empresa: solicitacaoCompleta.empresa.nome_empresa,
          cep: solicitacaoCompleta.empresa.cep,
          cidade: solicitacaoCompleta.empresa.cidade,
          bairro: solicitacaoCompleta.empresa.bairro,
          logradouro: solicitacaoCompleta.empresa.logradouro,
          numero: solicitacaoCompleta.empresa.numero,
          latitude: solicitacaoCompleta.empresa.latitude,
          longitude: solicitacaoCompleta.empresa.longitude,
        },
      };

      for (const entregador of entregadoresProximos) {
        this.entregasGateway.notificarEntregador(
          String(entregador.id),
          notificacaoPayload
        );
      }
    } catch (error) {
      this.logger.error(
        `Falha ao processar evento 'solicitacao.criada': ${error.message}`,
        error.stack
      );
    }
  }

  private async buscarEntregadoresProximos(
    lon: number,
    lat: number
  ): Promise<Entregador[]> {
    this.logger.log(
      `Buscando entregadores. Centro: [${lon}, ${lat}]. Raio: ${RAIO_BUSCA_METROS}m`
    );

    const longitude = Number(lon);
    const latitude = Number(lat);

    const query = Prisma.sql`
    SELECT id, nome, latitude, longitude, status
    FROM "entregadores" 
    WHERE
      status = 'online' AND 
      ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography,
        ${RAIO_BUSCA_METROS}::double precision
      )
    LIMIT 10;
  `;

    try {
      const entregadores = await this.prisma.$queryRaw<Entregador[]>(query);
      return entregadores;
    } catch (error) {
      this.logger.error(
        `Erro na query PostGIS 'buscarEntregadoresProximos': ${error.message}`,
        error.stack
      );
      return [];
    }
  }

  async aceitarEntrega(idSolicitacao: number, idEntregador: number) {
    this.logger.log(
      `Iniciando transação de aceite: Sol. ${idSolicitacao} por Ent. ${idEntregador}`
    );

    try {
      const novaEntrega = await this.prisma.$transaction(async (prisma) => {
        const solicitacao = await prisma.solicitacoesEntregas.findFirst({
          where: {
            id: idSolicitacao,
            status: "pendente",
          },
        });

        if (!solicitacao) {
          throw new ConflictException(
            "Esta solicitação já foi aceita ou cancelada."
          );
        }

        const entregador = await prisma.entregador.findFirst({
          where: {
            id: idEntregador,
            status: "online",
          },
        });

        if (!entregador) {
          throw new ConflictException(
            "A entrega só pode ser aceita se estiver on-line."
          );
        }

        await prisma.solicitacoesEntregas.update({
          where: { id: idSolicitacao },
          data: { status: "atribuida" },
        });

        await prisma.entregador.update({
          where: { id: idEntregador },
          data: { status: "em_entrega" },
        });

        const entregaCriada = await prisma.entregas.create({
          data: {
            status: "em_andamento",
            solicitacao_entrega_id: idSolicitacao,
            entregador_id: idEntregador,
            valor_entrega: solicitacao.valor_entregador,
          },
        });

        this.logger.log(`TRANSAÇÃO OK: Entrega ${entregaCriada.id} criada.`);
        return entregaCriada;
      });

      return novaEntrega;
    } catch (error) {
      this.logger.error(
        `Falha na transação 'aceitarEntrega': ${error.message}`
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new NotFoundException(
        "Não foi possível aceitar a entrega. Tenta novamente."
      );
    }
  }
}
