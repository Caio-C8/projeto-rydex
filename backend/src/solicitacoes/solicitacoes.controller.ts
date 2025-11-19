import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Usuario } from "../auth/usuario.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { UsuarioPayload } from "../auth/jwt.strategy";
import { CriarSolicitacaoDto } from "./dto/criar-solicitacao.dto";
import { SolicitacoesService } from "./solicitacoes.service";
import { EmpresaGuard } from "src/auth/guards/empresa.guard";
import { RespostaErroGeralDto } from "src/utils/dto/resposta-erro-geral.dto";
import { SolicitacoesEntregas } from "@prisma/client";

@ApiTags("Solicitações de entrega")
@ApiBearerAuth()
@Controller("solicitacoes")
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiOperation({
    summary: "Cria uma nova solicitação de entrega (chamado de corrida).",
    description:
      "Apenas usuários do tipo Empresa podem criar solicitações. O saldo da empresa será debitado no momento da criação.",
  })
  @ApiBody({
    type: CriarSolicitacaoDto,
    description:
      "Dados da solicitação, incluindo origem, destino e detalhes da carga.",
  })
  @ApiResponse({
    status: 201,
    description:
      "Solicitação de entrega criada com sucesso. Retorna os detalhes da solicitação.",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado (Token ausente ou inválido).",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 403,
    description: "Proibido (Usuário não é do tipo 'empresa').",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 400,
    description:
      "Requisição inválida (Faltando dados obrigatórios ou saldo insuficiente, etc.).",
    type: RespostaErroGeralDto,
  })
  async criarSolicitacao(
    @Body() dto: CriarSolicitacaoDto,
    @Usuario() empresa: UsuarioPayload
  ): Promise<SolicitacoesEntregas> {
    return this.solicitacoesService.criarSolicitacaoEntrega(dto, empresa.sub);
  }
}
