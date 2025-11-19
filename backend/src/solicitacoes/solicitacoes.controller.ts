import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Usuario } from "../auth/usuario.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { UsuarioPayload } from "../auth/jwt.strategy";
import { CriarSolicitacaoDto } from "./dto/criar-solicitacao.dto";
import { SolicitacoesService } from "./solicitacoes.service";
import { EmpresaGuard } from "src/auth/guards/empresa.guard";

@ApiTags("Solicitações (Empresa)")
@Controller("solicitacoes")
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmpresaGuard)
  async criarSolicitacao(
    @Body() dto: CriarSolicitacaoDto,
    @Usuario() empresa: UsuarioPayload
  ) {
    return this.solicitacoesService.criarSolicitacaoEntrega(dto, empresa.sub);
  }
}
