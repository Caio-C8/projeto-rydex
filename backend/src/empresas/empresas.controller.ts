import {
  Get,
  Body,
  Controller,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { EmpresasServices } from "./empresas.service";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto";
import { Empresa } from "@prisma/client";
import { AlterarEmpresaDto } from "./dto/alterar-empresa.dto";
import { TransacaoSaldoDto } from "./dto/empresa-transacao-saldo.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { EmpresaGuard } from "src/auth/guards/empresa.guard";
import { Usuario } from "src/auth/usuario.decorator";
import { type UsuarioPayload } from "src/auth/jwt.strategy";

@Controller("empresas")
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasServices) {}

  @UseGuards(JwtAuthGuard, EmpresaGuard)
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
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  removerEmpresa(@Usuario() usuario: UsuarioPayload): Promise<void> {
    return this.empresasService.removerEmpresa(usuario.sub);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @Patch()
  alterarEmpresa(
    @Usuario() usuario: UsuarioPayload,
    @Body() alterarEmpresaDto: AlterarEmpresaDto
  ): Promise<Empresa> {
    return this.empresasService.alterarEmpresa(usuario.sub, alterarEmpresaDto);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @Get("me")
  buscarMeusDados(@Usuario() usuario: UsuarioPayload): Promise<Empresa> {
    return this.empresasService.buscarEmpresaPorId(usuario.sub);
  }

  @Post()
  criarEmrpesa(@Body() criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    return this.empresasService.criarEmpresa(criarEmpresaDto);
  }

  @Get(":id")
  buscarEmpresaPorId(@Param("id", ParseIntPipe) id: number): Promise<Empresa> {
    return this.empresasService.buscarEmpresaPorId(id);
  }
}
