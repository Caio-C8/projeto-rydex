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
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: solicitacao.empresa_id },
      });

      if (!empresa || !empresa.latitude || !empresa.longitude) {
        this.logger.error(
          `Empresa ${solicitacao.empresa_id} não encontrada ou sem coordenadas.`
        );
        return;
      }

      const entregadoresProximos = await this.buscarEntregadoresProximos(
        empresa.longitude,
        empresa.latitude
      );

      this.logger.log(
        `Encontrados ${entregadoresProximos.length} entregadores próximos.`
      );

      for (const entregador of entregadoresProximos) {
        this.entregasGateway.notificarEntregador(
          String(entregador.id),
          solicitacao
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
    const query = Prisma.sql`
      SELECT *
      FROM "entregadores" 
      WHERE
        status = 'online' AND 
        ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${lon}, ${lat})::geography,
          ${RAIO_BUSCA_METROS}
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
