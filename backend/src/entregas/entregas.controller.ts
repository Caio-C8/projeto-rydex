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
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("entregas")
@Controller("entregas")
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @Post(":id/aceitar")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Aceita uma solicitação de entrega (Apenas Entregadores)",
  })
  async aceitarEntrega(
    @Param("id", ParseIntPipe) idSolicitacao: number,
    @Request() req
  ) {
    const idEntregador = req.user.sub;

    return this.entregasService.aceitarEntrega(idSolicitacao, idEntregador);
  }
}
