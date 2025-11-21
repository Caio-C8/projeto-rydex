import {
  Get,
  Body,
  Controller,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { EmpresasServices } from "./empresas.service";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto";
import { Empresa } from "@prisma/client";
import { AlterarEmpresaDto } from "./dto/alterar-empresa.dto";
import { TransacaoSaldoDto } from "./dto/empresa-transacao-saldo.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { EmpresaGuard } from "src/auth/guards/empresa.guard";
import { Usuario } from "src/auth/usuario.decorator";
import { type UsuarioPayload } from "src/auth/jwt.strategy";
import { RespostaErroGeralDto } from "src/utils/dto/resposta-erro-geral.dto";
import { RespostaErroValidacaoDto } from "src/utils/dto/resposta-erro-validacao.dto";
import { RedefinirSenhaDto } from "./dto/redefinir-senha.dto";

@ApiTags("Empresas")
@Controller("empresas")
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasServices) {}

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Adicionar saldo à carteira da empresa",
    description:
      "Incrementa o valor informado ao saldo atual da empresa logada.",
  })
  @ApiBody({ type: TransacaoSaldoDto })
  @ApiResponse({
    status: 201,
    description: "Saldo adicionado com sucesso.",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado (Token inválido ou ausente).",
    type: RespostaErroGeralDto,
  })
  @Post("adicionar-saldo")
  adicionarSaldo(
    @Usuario() usuario: UsuarioPayload,
    @Body() transacaoSaldoDto: TransacaoSaldoDto
  ): Promise<Empresa> {
    return this.empresasService.adicionarSaldo(
      usuario.sub,
      transacaoSaldoDto.valor
    );
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Remover (sacar) saldo da carteira da empresa",
    description:
      "Decrementa o valor informado do saldo atual, caso haja fundos suficientes.",
  })
  @ApiBody({ type: TransacaoSaldoDto })
  @ApiResponse({
    status: 201,
    description: "Saldo removido com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Saldo insuficiente ou valor inválido.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado.",
    type: RespostaErroGeralDto,
  })
  @Post("remover-saldo")
  removerSaldo(
    @Usuario() usuario: UsuarioPayload,
    @Body() transacaoSaldoDto: TransacaoSaldoDto
  ): Promise<Empresa> {
    return this.empresasService.removerSaldo(
      usuario.sub,
      transacaoSaldoDto.valor
    );
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Alterar dados da empresa",
    description:
      "Atualiza informações cadastrais como endereço, nome, etc. Se o endereço mudar, as coordenadas são recalculadas automaticamente.",
  })
  @ApiBody({ type: AlterarEmpresaDto })
  @ApiResponse({
    status: 200,
    description: "Dados atualizados com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Erro de validação nos dados enviados.",
    type: RespostaErroValidacaoDto,
  })
  @ApiResponse({
    status: 404,
    description: "Empresa não encontrada.",
    type: RespostaErroGeralDto,
  })
  @Patch()
  alterarEmpresa(
    @Usuario() usuario: UsuarioPayload,
    @Body() alterarEmpresaDto: AlterarEmpresaDto
  ): Promise<Empresa> {
    return this.empresasService.alterarEmpresa(usuario.sub, alterarEmpresaDto);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obter dados do perfil da empresa logada",
    description: "Retorna todas as informações da empresa autenticada.",
  })
  @ApiResponse({
    status: 200,
    description: "Dados recuperados com sucesso.",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado.",
    type: RespostaErroGeralDto,
  })
  @Get("me")
  buscarMeusDados(@Usuario() usuario: UsuarioPayload): Promise<Empresa> {
    return this.empresasService.buscarEmpresaPorId(usuario.sub);
  }

  @ApiOperation({
    summary: "Cadastrar uma nova empresa",
    description: "Cria uma nova conta de empresa no sistema.",
  })
  @ApiBody({ type: CriarEmpresaDto })
  @ApiResponse({
    status: 201,
    description: "Empresa criada com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Erro de validação ou senhas não conferem.",
    type: RespostaErroValidacaoDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: Email ou CNPJ já cadastrados.",
    type: RespostaErroGeralDto,
  })
  @Post()
  criarEmrpesa(@Body() criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    return this.empresasService.criarEmpresa(criarEmpresaDto);
  }

  @ApiOperation({
    summary: "Buscar empresa por ID (Público/Admin)",
    description: "Retorna os dados públicos de uma empresa específica.",
  })
  @ApiParam({ name: "id", description: "ID da empresa", type: Number })
  @ApiResponse({
    status: 200,
    description: "Empresa encontrada.",
  })
  @ApiResponse({
    status: 404,
    description: "Empresa não encontrada.",
    type: RespostaErroGeralDto,
  })
  @Get(":id")
  buscarEmpresaPorId(@Param("id", ParseIntPipe) id: number): Promise<Empresa> {
    return this.empresasService.buscarEmpresaPorId(id);
  }

  @ApiOperation({
    summary: "Redefinir senha (Esqueci minha senha)",
    description:
      "Permite alterar a senha sem estar logado, validando o E-mail e o CNPJ da empresa.",
  })
  @ApiBody({ type: RedefinirSenhaDto })
  @ApiResponse({
    status: 204,
    description: "Senha alterada com sucesso.",
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: "Senhas não conferem ou dados inválidos.",
    type: RespostaErroValidacaoDto,
  })
  @ApiResponse({
    status: 404,
    description: "Empresa não encontrada com os dados informados.",
    type: RespostaErroGeralDto,
  })
  @Patch("recuperacao-senha")
  async redefinirSenha(
    @Body() redefinirSenhaDto: RedefinirSenhaDto
  ): Promise<String> {
    return this.empresasService.redefinirSenha(redefinirSenhaDto);
  }
}
