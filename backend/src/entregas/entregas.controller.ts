import {
  Controller,
  Param,
  Post,
  Get,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { EntregasService } from "./entregas.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { EntregadorGuard } from "src/auth/guards/entregador.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { RespostaErroGeralDto } from "src/utils/dto/resposta-erro-geral.dto";
import { Usuario } from "src/auth/usuario.decorator";
import { type UsuarioPayload } from "src/auth/jwt.strategy";
import { Entregas } from "@prisma/client";

@ApiTags("Entregas")
@Controller("entregas")
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Aceita uma solicitação de entrega (Apenas Entregadores)",
    description:
      "Permite que um entregador aceite uma solicitação de entrega disponível, alterando o status da solicitação e criando uma nova entrega associada.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID da solicitação de entrega a ser aceita.",
    example: 42,
  })
  @ApiResponse({
    status: 201,
    description:
      "Entrega aceita com sucesso. Retorna os dados da nova entrega.",
  })
  @ApiResponse({
    status: 404,
    description: "Solicitação de entrega não encontrada.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 409,
    description: "A solicitação já foi aceita por outro entregador.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado (Token ausente ou inválido).",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 403,
    description: "Proibido (Usuário autenticado não é um entregador).",
    type: RespostaErroGeralDto,
  })
  @Post(":id/aceitar")
  async aceitarEntrega(
    @Param("id", ParseIntPipe) idSolicitacao: number,
    @Usuario() usuario: UsuarioPayload
  ) {
    return this.entregasService.aceitarEntrega(idSolicitacao, usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Finaliza uma entrega em andamento",
    description:
      "Marca a entrega e a solicitação como finalizadas, libera o entregador para novas corridas e transfere o saldo da empresa para o entregador.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID da entrega (não da solicitação) a ser finalizada.",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Entrega finalizada com sucesso.",
  })
  @ApiResponse({
    status: 404,
    description: "Entrega não encontrada ou não pertence ao entregador.",
    type: RespostaErroGeralDto,
  })
  @Post(":id/finalizar")
  async finalizarEntrega(
    @Param("id", ParseIntPipe) idEntrega: number,
    @Usuario() usuario: UsuarioPayload
  ) {
    return this.entregasService.finalizarEntrega(idEntrega, usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cancela uma entrega em andamento (Desistência)",
    description:
      "O entregador desiste da entrega. O status dele volta para 'online' e a solicitação volta para 'pendente' (disponível para outros entregadores).",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID da entrega a ser cancelada.",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Entrega cancelada com sucesso.",
    schema: {
      example: {
        message: "Entrega cancelada com sucesso. Você está online novamente.",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Entrega não encontrada ou não pertence ao entregador.",
    type: RespostaErroGeralDto,
  })
  @Post(":id/cancelar")
  async cancelarEntrega(
    @Param("id", ParseIntPipe) idEntrega: number,
    @Usuario() usuario: UsuarioPayload
  ) {
    return this.entregasService.cancelarEntrega(idEntrega, usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Listar Minhas Entregas (Histórico do Entregador)",
    description: "Retorna todas as entregas associadas ao entregador logado.",
  })
  @ApiResponse({
    status: 200,
    description: "Histórico de entregas do entregador.",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado.",
    type: RespostaErroGeralDto,
  })
  @Get("me")
  async buscarMinhasEntregas(
    @Usuario() usuario: UsuarioPayload
  ): Promise<Entregas[]> {
    return this.entregasService.buscarPorEntregador(usuario.sub);
  }

  @ApiOperation({
    summary: "Buscar detalhes de uma entrega específica",
    description: "Retorna os dados de uma entrega pelo seu ID.",
  })
  @ApiParam({ name: "id", description: "ID da entrega" })
  @ApiResponse({
    status: 200,
    description: "Dados da entrega encontrada.",
  })
  @ApiResponse({
    status: 404,
    description: "Entrega não encontrada.",
    type: RespostaErroGeralDto,
  })
  @Get(":id")
  async buscarEntregaPorId(
    @Param("id", ParseIntPipe) id: number
  ): Promise<Entregas> {
    return this.entregasService.buscarPorId(id);
  }

  @ApiOperation({
    summary: "Listar TODAS as entregas (Público/Admin)",
    description:
      "Retorna todas as entregas do sistema, ordenadas da mais recente para a mais antiga.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista completa de entregas.",
  })
  @Get()
  async buscarTodasEntregas(): Promise<Entregas[]> {
    return this.entregasService.buscarTodas();
  }
}
