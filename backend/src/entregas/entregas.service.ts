import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  Entregador,
  Prisma,
  StatusEntregadores,
  StatusEntregas,
  StatusSolicitacoes,
  type SolicitacoesEntregas,
  Entregas,
} from "@prisma/client";
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
    this.logger.log(`Evento recebido: Nova solicitação ${solicitacao.id}`);
    await this.buscarENotificarEntregadores(solicitacao.id);
  }

  async aceitarEntrega(idSolicitacao: number, idEntregador: number) {
    this.logger.log(
      `Iniciando transação de aceite: Sol. ${idSolicitacao} por Ent. ${idEntregador}`
    );

    try {
      const resultado = await this.prisma.$transaction(async (prisma) => {
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
          data: { status: StatusSolicitacoes.atribuida },
        });

        await prisma.entregador.update({
          where: { id: idEntregador },
          data: { status: StatusEntregadores.em_entrega },
        });

        const entregaCriada = await prisma.entregas.create({
          data: {
            status: StatusEntregas.em_andamento,
            solicitacao_entrega_id: idSolicitacao,
            entregador_id: idEntregador,
            valor_entrega: solicitacao.valor_entregador,
          },
        });

        this.logger.log(`TRANSAÇÃO OK: Entrega ${entregaCriada.id} criada.`);

        return {
          entrega: entregaCriada,
          empresaId: solicitacao.empresa_id,
          entregador: entregador,
        };
      });

      this.entregasGateway.notificarEmpresaStatus(resultado.empresaId, {
        solicitacaoId: idSolicitacao,
        status: "atribuida",
        mensagem: "Um entregador aceitou o seu pedido!",
        entregadorNome: resultado.entregador.nome || "Entregador a caminho",
      });

      return resultado;
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

  async finalizarEntrega(idEntrega: number, idEntregador: number) {
    this.logger.log(
      `Tentativa de finalizar entrega ${idEntrega} pelo entregador ${idEntregador}`
    );

    try {
      const resultado = await this.prisma.$transaction(async (prisma) => {
        const entrega = await prisma.entregas.findFirst({
          where: {
            id: idEntrega,
            entregador_id: idEntregador,
            status: StatusEntregas.em_andamento,
          },
          include: {
            solicitacao_entrega: true,
          },
        });

        if (!entrega) {
          throw new NotFoundException(
            "Entrega não encontrada ou não está em andamento para este entregador."
          );
        }

        const valorEntrega = entrega.valor_entrega;

        const entregaAtualizada = await prisma.entregas.update({
          where: { id: idEntrega },
          data: {
            status: StatusEntregas.finalizada,
          },
        });

        await prisma.solicitacoesEntregas.update({
          where: { id: entrega.solicitacao_entrega_id },
          data: { status: StatusSolicitacoes.finalizada },
        });

        await prisma.entregador.update({
          where: { id: idEntregador },
          data: {
            status: StatusEntregadores.online,
            saldo: { increment: valorEntrega },
          },
        });

        this.logger.log(`Entrega ${idEntrega} finalizada com sucesso.`);

        return { entregaAtualizada: entregaAtualizada, entrega: entrega };
      });

      const empresaId = resultado.entrega.solicitacao_entrega.empresa_id;

      this.entregasGateway.notificarEmpresaStatus(empresaId, {
        solicitacaoId: resultado.entrega.solicitacao_entrega_id,
        status: "finalizada",
        mensagem: "A entrega foi concluída com sucesso!",
      });

      return resultado.entregaAtualizada;
    } catch (error) {
      this.logger.error(
        `Erro ao finalizar entrega ${idEntrega}: ${error.message}`,
        error.stack
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException("Não foi possível finalizar a entrega.");
    }
  }

  async cancelarEntrega(idEntrega: number, idEntregador: number) {
    this.logger.log(
      `Cancelando entrega ${idEntrega} (Entregador ${idEntregador})`
    );

    let idSolicitacaoParaNotificar: number | null = null;

    try {
      await this.prisma.$transaction(async (prisma) => {
        const entrega = await prisma.entregas.findFirst({
          where: {
            id: idEntrega,
            entregador_id: idEntregador,
            status: StatusEntregas.em_andamento,
          },
        });

        if (!entrega) {
          throw new NotFoundException(
            "Entrega não encontrada ou já finalizada."
          );
        }

        idSolicitacaoParaNotificar = entrega.solicitacao_entrega_id;

        await prisma.entregas.update({
          where: { id: idEntrega },
          data: {
            status: StatusEntregas.cancelada,
            cancelado_em: new Date(),
          },
        });

        await prisma.entregador.update({
          where: { id: idEntregador },
          data: { status: StatusEntregadores.online },
        });

        await prisma.solicitacoesEntregas.update({
          where: { id: entrega.solicitacao_entrega_id },
          data: { status: StatusSolicitacoes.pendente },
        });
      });

      if (idSolicitacaoParaNotificar) {
        this.logger.log(
          `Reenviando solicitação ${idSolicitacaoParaNotificar} para a fila.`
        );

        this.buscarENotificarEntregadores(idSolicitacaoParaNotificar);
      }

      return {
        message: "Entrega cancelada. A solicitação foi devolvida para a fila.",
      };
    } catch (error) {
      this.logger.error(`Erro no cancelamento: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new ConflictException("Erro ao cancelar entrega.");
    }
  }

  async buscarTodas(): Promise<Entregas[]> {
    return this.prisma.entregas.findMany({
      orderBy: {
        criado_em: "desc",
      },
      include: {
        solicitacao_entrega: {
          include: {
            empresa: {
              select: {
                nome_empresa: true,
              },
            },
          },
        },
        entregador: {
          select: {
            nome: true,
          },
        },
      },
    });
  }

  async buscarPorEntregador(idEntregador: number): Promise<Entregas[]> {
    return this.prisma.entregas.findMany({
      where: {
        entregador_id: idEntregador,
      },
      orderBy: {
        criado_em: "desc",
      },
      include: {
        solicitacao_entrega: {
          include: {
            empresa: {
              select: {
                nome_empresa: true,
              },
            },
          },
        },
      },
    });
  }

  async buscarPorId(id: number): Promise<Entregas> {
    const entrega = await this.prisma.entregas.findUnique({
      where: { id },
      include: {
        solicitacao_entrega: true,
        entregador: {
          select: {
            id: true,
            nome: true,
            placa_veiculo: true,
          },
        },
      },
    });

    if (!entrega) {
      throw new NotFoundException(`Entrega com ID ${id} não encontrada.`);
    }

    return entrega;
  }

  async buscarEntregadoresProximos(
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

  private async buscarENotificarEntregadores(idSolicitacao: number) {
    try {
      const solicitacaoCompleta =
        await this.prisma.solicitacoesEntregas.findUnique({
          where: { id: idSolicitacao },
          select: {
            id: true,
            valor_entregador: true,
            valor_estimado: true,
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
          `Solicitação ${idSolicitacao} não encontrada no banco para notificação.`
        );
        return;
      }

      if (solicitacaoCompleta.status !== "pendente") {
        this.logger.warn(`Solicitação ${idSolicitacao} não está pendente.`);
        return;
      }

      if (
        !solicitacaoCompleta.empresa.latitude ||
        !solicitacaoCompleta.empresa.longitude
      ) {
        this.logger.error(
          `Empresa ${solicitacaoCompleta.empresa.id} sem coordenadas.`
        );
        return;
      }

      const entregasCanceladas = await this.prisma.entregas.findMany({
        where: {
          solicitacao_entrega_id: idSolicitacao,
          status: StatusEntregas.cancelada,
        },
        select: {
          entregador_id: true,
        },
      });

      const idsIgnorar = new Set(
        entregasCanceladas.map((e) => e.entregador_id)
      );

      const entregadoresProximos = await this.buscarEntregadoresProximos(
        solicitacaoCompleta.empresa.longitude,
        solicitacaoCompleta.empresa.latitude
      );

      const entregadoresParaNotificar = entregadoresProximos.filter(
        (entregador) => !idsIgnorar.has(entregador.id)
      );

      if (entregadoresParaNotificar.length === 0) {
        this.logger.warn(
          `Nenhum entregador próximo disponível para a solicitação ${idSolicitacao}. Cancelando solicitação e estornando valor.`
        );

        await this.prisma.$transaction(async (prisma) => {
          await prisma.solicitacoesEntregas.update({
            where: { id: idSolicitacao },
            data: {
              status: StatusSolicitacoes.cancelada,
              cancelado_em: new Date(),
            },
          });

          await prisma.empresa.update({
            where: { id: solicitacaoCompleta.empresa.id },
            data: {
              saldo: { increment: solicitacaoCompleta.valor_estimado },
            },
          });
        });

        this.entregasGateway.notificarEmpresaStatus(
          solicitacaoCompleta.empresa.id,
          {
            solicitacaoId: idSolicitacao,
            status: "cancelada",
            mensagem:
              "Não foram encontrados entregadores próximos. O valor foi estornado.",
          }
        );

        return;
      }

      this.logger.log(
        `Notificando solicitação ${idSolicitacao} para ${entregadoresParaNotificar.length} entregadores.`
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

      for (const entregador of entregadoresParaNotificar) {
        this.entregasGateway.notificarEntregador(
          String(entregador.id),
          notificacaoPayload
        );
      }
    } catch (error) {
      this.logger.error(`Erro ao notificar entregadores: ${error.message}`);
    }
  }
}
