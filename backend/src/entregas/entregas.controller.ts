import {
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
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

@ApiTags("Entregas")
@Controller("entregas")
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @Post(":id/aceitar")
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
  async aceitarEntrega(
    @Param("id", ParseIntPipe) idSolicitacao: number,
    @Request() req
  ) {
    const idEntregador = req.user.sub;

    return this.entregasService.aceitarEntrega(idSolicitacao, idEntregador);
  }
}
