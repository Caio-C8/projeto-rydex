import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SolicitacoesEntregas } from '@prisma/client';
import { PrismaService } from '../prisma.service'; // Verifique se o caminho está correto
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';

@Injectable()
export class SolicitacoesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Cria uma nova solicitação de entrega e dispara o evento.
   * @param dto Dados da solicitação (endereço, valor, etc.)
   * @param empresaId ID da empresa (vinda do token)
   */
  async criarSolicitacaoEntrega(
    dto: CriarSolicitacaoDto,
    empresaId: number,
  ): Promise<SolicitacoesEntregas> {
    // 1. Salva a solicitação no banco de dados (quase todos os campos)
    const solicitacao = await this.prisma.solicitacoesEntregas.create({
      data: {
        valor_estimado: dto.valor_estimado,
        distancia_m: dto.distancia_m,
        latitude: dto.latitude,
        longitude: dto.longitude,
        cep: dto.cep,
        cidade: dto.cidade,
        numero: dto.numero,
        bairro: dto.bairro,
        logradouro: dto.logradouro,
        complemento: dto.complemento,
        ponto_referencia: dto.ponto_referencia,
        item_retorno: dto.item_retorno,
        descricao_item_retorno: dto.descricao_item_retorno,
        observacao: dto.observacao,
        empresa_id: empresaId,
        status: 'pendente', 
      },
    });

    await this.prisma.$queryRawUnsafe(
      `UPDATE "solicitacoes_entregas"
       SET "localizacao" = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
       WHERE "id" = ${solicitacao.id}`,
    );

    this.eventEmitter.emit('solicitacao.criada', solicitacao);

    return solicitacao;
  }
}