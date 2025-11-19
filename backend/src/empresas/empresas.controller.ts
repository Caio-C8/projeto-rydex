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

@Controller("empresas")
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasServices) {}

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @Post(":id/adicionar-saldo")
  adicionarSaldo(
    @Param("id", ParseIntPipe) id: number,
    @Body() transacaoSaldoDto: TransacaoSaldoDto
  ): Promise<Empresa> {
    // Retorna a empresa atualizada (sem a senha)
    return this.empresasService.adicionarSaldo(id, transacaoSaldoDto.valor);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @Post(":id/remover-saldo")
  removerSaldo(
    @Param("id", ParseIntPipe) id: number,
    @Body() transacaoSaldoDto: TransacaoSaldoDto
  ): Promise<Empresa> {
    // Retorna a empresa atualizada (sem a senha)
    return this.empresasService.removerSaldo(id, transacaoSaldoDto.valor);
  }

  @Delete(":id/deletar-empresa")
  @HttpCode(HttpStatus.NO_CONTENT)
  removerEmpresa(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.empresasService.removerEmpresa(id);
  }

  @Post()
  criarEmrpesa(@Body() criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    return this.empresasService.criarEmpresa(criarEmpresaDto);
  }

  @UseGuards(JwtAuthGuard, EmpresaGuard)
  @Patch(":id")
  alterarEmpresa(
    @Param("id", ParseIntPipe) id: number,
    @Body() alterarEmpresaDto: AlterarEmpresaDto
  ): Promise<Empresa> {
    return this.empresasService.alterarEmpresa(id, alterarEmpresaDto);
  }

  @Get(":id")
  buscarEmpresaPorId(@Param("id", ParseIntPipe) id: number): Promise<Empresa> {
    return this.empresasService.buscarEmpresaPorId(id);
  }
}
