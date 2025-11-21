import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EntregadoresService } from "./entregadores.service";
import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { CriarEntregadorSwaggerDto } from "./dto/criar-entregador-swagger.dto";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { AlterarEntregadorSwaggerDto } from "./dto/alterar-entregador-swagger.dto";
import { RespostaArquivosDto } from "./dto/resposta-arquivos.dto";
import { RespostaEntregadorDto } from "./dto/resposta-entregador.dto";
import { RespostaErroValidacaoDto } from "src/utils/dto/resposta-erro-validacao.dto";
import { RespostaErroGeralDto } from "src/utils/dto/resposta-erro-geral.dto";
import { TransacaoSaldoDto } from "./dto/transacao-saldo.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { EntregadorGuard } from "src/auth/guards/entregador.guard";
import { Usuario } from "src/auth/usuario.decorator";
import { type UsuarioPayload } from "src/auth/jwt.strategy";
import { AtualizarLocalizacaoDto } from "./dto/atualizar-localizacao.dto";

@ApiTags("Entregadores")
@Controller("entregadores")
export class EntregadoresController {
  constructor(private readonly entregadoresService: EntregadoresService) {}

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Buscar meus dados (Perfil do entregador logado)" })
  @ApiResponse({ status: 200, type: RespostaEntregadorDto })
  @Get("me")
  buscarMeusDados(
    @Usuario() usuario: UsuarioPayload
  ): Promise<RespostaEntregadorDto> {
    return this.entregadoresService.buscarEntregador(usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Buscar meus arquivos (CNH/Veículo)" })
  @ApiResponse({ status: 200, type: [RespostaArquivosDto] })
  @Get("me/arquivos")
  buscarMeusArquivos(
    @Usuario() usuario: UsuarioPayload
  ): Promise<RespostaArquivosDto[]> {
    return this.entregadoresService.buscarArquivos(usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiOperation({ summary: "Atualizar dados ou documentos de um entregador" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiBody({
    description:
      "Dados do entregador e/ou arquivos de documento para atualizar",
    type: AlterarEntregadorSwaggerDto,
  })
  @ApiResponse({
    status: 200,
    description: "Entregador atualizado com sucesso",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erros de validação nos dados enviados.",
    type: RespostaErroValidacaoDto,
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "imagemCnh", maxCount: 1 },
      { name: "imagemDocVeiculo", maxCount: 1 },
    ])
  )
  @Patch("perfil")
  atualizarMeuPerfil(
    @Usuario() usuario: UsuarioPayload,
    @Body() alterarEntregadorDto: AlterarEntregadorDto,
    @UploadedFiles()
    files: {
      imagemCnh?: Express.Multer.File[];
      imagemDocVeiculo?: Express.Multer.File[];
    }
  ): Promise<RespostaEntregadorDto> {
    const imagemCnh = files.imagemCnh ? files.imagemCnh[0] : undefined;
    const imagemDocVeiculo = files.imagemDocVeiculo
      ? files.imagemDocVeiculo[0]
      : undefined;

    return this.entregadoresService.alterarEntregador(
      usuario.sub,
      alterarEntregadorDto,
      imagemCnh,
      imagemDocVeiculo
    );
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiOperation({ summary: "Adicionar saldo a um entregador" })
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiBody({
    description: "Valor a ser adicionado (em centavos)",
    type: TransacaoSaldoDto,
  })
  @ApiResponse({
    status: 200,
    description: "Saldo atualizado com sucesso",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erros de validação nos dados enviados.",
    type: RespostaErroValidacaoDto,
  })
  @Post("saldo/adicionar")
  adicionarSaldo(
    @Usuario() usuario: UsuarioPayload,
    @Body() transacaoDto: TransacaoSaldoDto
  ): Promise<RespostaEntregadorDto> {
    return this.entregadoresService.adicionarSaldo(
      usuario.sub,
      transacaoDto.valor
    );
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiOperation({ summary: "Retirar saldo de um entregador" })
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiBody({
    description: "Valor a ser retirado (em centavos)",
    type: TransacaoSaldoDto,
  })
  @ApiResponse({
    status: 200,
    description: "Saldo atualizado com sucesso",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 400,
    description:
      "Erros de validação (Ex: Saldo insuficiente, Valor mínimo não atingido).",
    type: RespostaErroValidacaoDto,
  })
  @Post("saldo/retirar")
  retirarSaldo(
    @Usuario() usuario: UsuarioPayload,
    @Body() transacaoDto: TransacaoSaldoDto
  ): Promise<RespostaEntregadorDto> {
    return this.entregadoresService.retirarSaldo(
      usuario.sub,
      transacaoDto.valor
    );
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiOperation({ summary: "Definir status do entregador como ONLINE" })
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiResponse({
    status: 200,
    description: "Status do entregador atualizado para ONLINE",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 400,
    description: "Não é possível alterar o status (ex: em entrega).",
    type: RespostaErroValidacaoDto,
  })
  @Patch("status/online")
  definirStatusOnline(
    @Usuario() usuario: UsuarioPayload
  ): Promise<RespostaEntregadorDto> {
    return this.entregadoresService.definirStatusOnline(usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EntregadorGuard)
  @ApiOperation({ summary: "Definir status do entregador como OFFLINE" })
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiResponse({
    status: 200,
    description: "Status do entregador atualizado para OFFLINE",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @ApiResponse({
    status: 400,
    description: "Não é possível alterar o status (ex: em entrega).",
    type: RespostaErroValidacaoDto,
  })
  @Patch("status/offline")
  definirStatusOffline(
    @Usuario() usuario: UsuarioPayload
  ): Promise<RespostaEntregadorDto> {
    return this.entregadoresService.definirStatusOffline(usuario.sub);
  }

  @Patch("localizacao")
  async atualizarLocalizacao(
    @Usuario() usuario: UsuarioPayload,
    @Body() atualizarLocalizacaoDto: AtualizarLocalizacaoDto
  ): Promise<any> {
    return this.entregadoresService.atualizarLocalizacao(
      usuario.sub,
      atualizarLocalizacaoDto
    );
  }

  @ApiOperation({ summary: "Listar todos os entregadores" })
  @ApiResponse({
    status: 200,
    description: "Lista de todos os entregadores",
    type: [RespostaEntregadorDto],
  })
  @Get()
  buscarEntregadores(): Promise<RespostaEntregadorDto[]> {
    return this.entregadoresService.buscarEntregadores();
  }

  @ApiOperation({ summary: "Buscar um entregador por ID" })
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiResponse({
    status: 200,
    description: "Dados do entregador",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @Get(":id")
  buscarEntregador(
    @Param("id", ParseIntPipe) id: number
  ): Promise<RespostaEntregadorDto> {
    return this.entregadoresService.buscarEntregador(id);
  }

  @ApiOperation({ summary: "Buscar arquivos (CNH/Veículo) de um entregador" })
  @ApiParam({ name: "id", description: "ID do entregador", type: Number })
  @ApiResponse({
    status: 200,
    description: "Lista de arquivos do entregador",
    type: [RespostaArquivosDto],
  })
  @ApiResponse({
    status: 404,
    description: "Entregador não encontrado.",
    type: RespostaErroGeralDto,
  })
  @Get(":id/arquivos")
  buscarImagens(
    @Param("id", ParseIntPipe) id: number
  ): Promise<RespostaArquivosDto[]> {
    return this.entregadoresService.buscarArquivos(id);
  }

  @ApiOperation({ summary: "Criar um novo entregador com documentos" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Dados do entregador e arquivos de documento",
    type: CriarEntregadorSwaggerDto,
  })
  @ApiResponse({
    status: 201,
    description: "Entregador criado com sucesso",
    type: RespostaEntregadorDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erros de validação nos dados enviados.",
    type: RespostaErroValidacaoDto,
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "imagemCnh", maxCount: 1 },
      { name: "imagemDocVeiculo", maxCount: 1 },
    ])
  )
  criarEntregador(
    @Body() criarEntregadorDto: CriarEntregadorDto,
    @UploadedFiles()
    files: {
      imagemCnh?: Express.Multer.File[];
      imagemDocVeiculo?: Express.Multer.File[];
    }
  ): Promise<RespostaEntregadorDto> {
    const imagemCnh = files.imagemCnh ? files.imagemCnh[0] : undefined;
    const imagemDocVeiculo = files.imagemDocVeiculo
      ? files.imagemDocVeiculo[0]
      : undefined;

    return this.entregadoresService.criarEntregador(
      criarEntregadorDto,
      imagemCnh,
      imagemDocVeiculo
    );
  }
}
