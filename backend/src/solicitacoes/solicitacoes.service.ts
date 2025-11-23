import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SolicitacoesEntregas } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CriarSolicitacaoDto } from "./dto/criar-solicitacao.dto";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { normalizarDinheiro } from "src/utils/normalizar-dinheiro";
import { Inject, forwardRef } from "@nestjs/common";
import { EntregasService } from "../entregas/entregas.service";
export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface DadosRota {
  distancia_m: number;
  tempo_seg: number;
}

interface RespostaCalculoValorEstimado {
  valor_estimado: number;
  valor_entregador: number;
}

@Injectable()
export class SolicitacoesService {
  private readonly logger = new Logger(SolicitacoesService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(forwardRef(() => EntregasService))
    private entregasService: EntregasService
  ) {}

  async criarSolicitacaoEntrega(
    dto: CriarSolicitacaoDto,
    empresaId: number
  ): Promise<SolicitacoesEntregas> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { saldo: true, latitude: true, longitude: true },
    });

    if (!empresa || empresa.latitude === null || empresa.longitude === null) {
      throw new BadRequestException(
        "Coordenadas da empresa não encontradas. Por favor, complete o cadastro de endereço da empresa."
      );
    }

    const origem: Coordenadas = {
      latitude: empresa.latitude,
      longitude: empresa.longitude,
    };

    const destino: Coordenadas = await this.getCoordenadas(dto);

    const { distancia_m, tempo_seg } = await this.getDadosRota(origem, destino);

    const { valor_estimado, valor_entregador } = this.calcularValorEstimado(
      distancia_m,
      tempo_seg
    );

    if (empresa.saldo < valor_estimado) {
      throw new BadRequestException(
        `Saldo insuficiente. O custo estimado é de ${normalizarDinheiro(valor_estimado)}.`
      );
    }

    const novaSolicitacao = await this.prisma.$transaction(async (prisma) => {
      await prisma.empresa.update({
        where: { id: empresaId },
        data: {
          saldo: { decrement: valor_estimado },
        },
      });

      const solicitacao = await prisma.solicitacoesEntregas.create({
        data: {
          valor_estimado: valor_estimado,
          valor_entregador: valor_entregador,
          distancia_m: distancia_m,
          latitude: destino.latitude,
          longitude: destino.longitude,
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
          status: "pendente",
        },
      });

      await prisma.$queryRawUnsafe(
        `UPDATE "solicitacoes_entregas"
         SET "localizacao" = ST_SetSRID(ST_MakePoint(${destino.longitude}, ${destino.latitude}), 4326)
         WHERE "id" = ${solicitacao.id}`
      );

      return solicitacao;
    });

    this.eventEmitter.emit("solicitacao.criada", novaSolicitacao);

    return novaSolicitacao;
  }

  async buscarTodosPorEmpresa(
    empresaId: number
  ): Promise<SolicitacoesEntregas[]> {
    return this.prisma.solicitacoesEntregas.findMany({
      where: {
        empresa_id: empresaId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        entrega: {
          include: {
            entregador: {
              select: {
                id: true,
                nome: true,
                celular: true,
                placa_veiculo: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });
  }

  async buscarUm(id: number): Promise<SolicitacoesEntregas> {
    const solicitacao = await this.prisma.solicitacoesEntregas.findFirst({
      where: {
        id: id,
      },
      include: {
        entrega: {
          include: {
            entregador: {
              select: {
                id: true,
                nome: true,
                celular: true,
                placa_veiculo: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    if (!solicitacao) {
      throw new NotFoundException(
        `Solicitação ${id} não encontrada ou não pertence à sua empresa.`
      );
    }

    return solicitacao;
  }

  async buscarTodas(): Promise<SolicitacoesEntregas[]> {
    return this.prisma.solicitacoesEntregas.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        empresa: {
          select: {
            id: true,
            nome_empresa: true,
            latitude: true,
            longitude: true,
          },
        },
        entrega: {
          include: {
            entregador: {
              select: {
                id: true,
                nome: true,
                celular: true,
                placa_veiculo: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });
  }

  async simularSolicitacao(dto: CriarSolicitacaoDto, empresaId: number) {
    // 1. Busca Empresa
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { latitude: true, longitude: true },
    });

    if (!empresa || !empresa.latitude || !empresa.longitude) {
      throw new BadRequestException("Endereço da empresa inválido.");
    }

    const origem = { latitude: empresa.latitude, longitude: empresa.longitude };

    // 2. Busca Destino (Google)
    const destino = await this.getCoordenadas(dto);

    // 3. Calcula Rota (Google)
    const { distancia_m, tempo_seg } = await this.getDadosRota(origem, destino);

    // 4. Calcula Preço
    const { valor_estimado, valor_entregador } = this.calcularValorEstimado(
      distancia_m,
      tempo_seg
    );

    // 5. Busca Entregadores
    const entregadores = await this.entregasService.buscarEntregadoresProximos(
      origem.longitude,
      origem.latitude
    );

    this.logger.log(
      `[SIMULAÇÃO] Dist: ${distancia_m}m | Valor: ${valor_estimado}`
    );

    // 👇 RETORNO SIMPLIFICADO (FLAT) - Isso resolve o erro do modal!
    return {
      valor_estimado, // Número direto
      valor_entregador, // Número direto
      distancia_m, // Número direto (metros)
      tempo_seg, // Número direto (segundos)
      entregadores_online: entregadores.length,
      origem,
      destino,
    };
  }

  private async getCoordenadas(enderecoInfo: any): Promise<Coordenadas> {
    const apiKey = this.configService.get<string>("GOOGLE_MAPS_API_KEY");

    const enderecoCompleto = `${enderecoInfo.logradouro}, ${enderecoInfo.numero}, ${enderecoInfo.bairro}, ${enderecoInfo.cidade}, ${enderecoInfo.cep}`;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      enderecoCompleto
    )}&key=${apiKey}`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (
        data &&
        data.status === "OK" &&
        data.results &&
        data.results.length > 0
      ) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else if (data && data.status === "ZERO_RESULTS") {
        throw new BadRequestException(
          "O endereço de destino não foi encontrado. Por favor, revise os dados."
        );
      }

      throw new Error(
        data?.error_message ||
          `Erro desconhecido da API do Google Maps: Status ${data?.status}`
      );
    } catch (error) {
      this.logger.error(`Geocodificação falhou: ${error.message}`, error.stack);
      throw new BadRequestException(
        "Falha ao validar o endereço de destino com a API de mapas."
      );
    }
  }

  private async getDadosRota(
    origem: Coordenadas,
    destino: Coordenadas
  ): Promise<DadosRota> {
    const apiKey = this.configService.get<string>("GOOGLE_MAPS_API_KEY");
    const origins = `${origem.latitude},${origem.longitude}`;
    const destinations = `${destino.latitude},${destino.longitude}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&key=${apiKey}`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));

      const element = data?.rows?.[0]?.elements?.[0];

      if (element && element.status === "OK") {
        return {
          distancia_m: element.distance.value,
          tempo_seg: element.duration.value,
        };
      } else {
        const status = element?.status || data?.status;
        throw new BadRequestException(
          `Não foi possível calcular a rota entre os endereços. Status: ${status}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Cálculo de rota falhou: ${error.message}`,
        error.stack
      );
      throw new BadRequestException(
        "Falha ao calcular a rota de entrega com a API de mapas."
      );
    }
  }

  private calcularValorEstimado(
    distancia_m: number,
    tempo_seg: number
  ): RespostaCalculoValorEstimado {
    const TAXA_FIXA = Number(
      this.configService.get<string>("VALOR_TAXA_SERVICO") || 0
    );
    const VALOR_POR_M = Number(
      this.configService.get<string>("VALOR_POR_M") || 0
    );
    const VALOR_POR_SEG = Number(
      this.configService.get<string>("VALOR_POR_SEG") || 0
    );

    if (VALOR_POR_M === 0 && VALOR_POR_SEG === 0) {
      this.logger.warn(
        "Avisos de precificação: VALOR_POR_M e VALOR_POR_SEG parecem ser zero."
      );
    }

    const custo_distancia = VALOR_POR_M * distancia_m;
    const custo_tempo = VALOR_POR_SEG * tempo_seg;

    const valor_entregador = custo_distancia + custo_tempo;
    const valor_estimado_empresa = valor_entregador + TAXA_FIXA;

    this.logger.debug(
      `Cálculo: Dist(${distancia_m}m) Tempo(${tempo_seg}s) | Base: ${valor_entregador} | Taxa: ${TAXA_FIXA} | Empresa: ${valor_estimado_empresa} | Entregador: ${valor_entregador}`
    );

    return {
      valor_estimado: Math.round(valor_estimado_empresa),
      valor_entregador: Math.round(valor_entregador),
    };
  }
}
