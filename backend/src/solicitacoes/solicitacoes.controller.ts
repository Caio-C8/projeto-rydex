import {
  Body,
  Get,
  Param,
  Controller,
  Post,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";
import { Usuario } from "../auth/usuario.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { type UsuarioPayload } from "../auth/jwt.strategy";
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
  @Post()
  async criarSolicitacao(
    @Body() dto: CriarSolicitacaoDto,
    @Usuario() empresa: UsuarioPayload
  ): Promise<SolicitacoesEntregas> {
    return this.solicitacoesService.criarSolicitacaoEntrega(dto, empresa.sub);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiOperation({
    summary: "Lista o histórico de solicitações da empresa.",
    description:
      "Retorna todas as entregas criadas pela empresa logada, ordenadas da mais recente para a mais antiga.",
  })
  @ApiResponse({
    status: 200,
    description: "Histórico recuperado com sucesso.",
  })
  @Get()
  async buscarSolicitacoes(
    @Usuario() empresa: UsuarioPayload
  ): Promise<SolicitacoesEntregas[]> {
    return this.solicitacoesService.buscarTodosPorEmpresa(empresa.sub);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiOperation({
    summary: "Buscar detalhes de uma solicitação específica",
    description:
      "Retorna os detalhes de uma solicitação se ela pertencer à empresa logada.",
  })
  @ApiParam({ name: "id", description: "ID da solicitação" })
  @ApiResponse({
    status: 200,
    description: "Solicitação encontrada.",
  })
  @ApiResponse({
    status: 404,
    description: "Solicitação não encontrada ou não pertence a esta empresa.",
    type: RespostaErroGeralDto,
  })
  @Get(":id")
  async buscarSolicitacao(
    @Param("id", ParseIntPipe) id: number,
    @Usuario() empresa: UsuarioPayload
  ): Promise<SolicitacoesEntregas> {
    return this.solicitacoesService.buscarUmPorEmpresa(id, empresa.sub);
  }
}
