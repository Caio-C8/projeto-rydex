
import {
  Get,
  Body,
  Controller,
  Post,
  Patch, 
  Param, 
  ParseIntPipe, 
} from '@nestjs/common';
import { EmpresasServices } from './empresas.service';
import { CriarEmpresaDto } from './dto/criar-empresa.dto';
import { Empresa } from '@prisma/client';
import { AlterarEmpresaDto } from './dto/alterar-empresa.dto'; 

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasServices) {}

  @Post()
  criarEmrpesa(@Body() criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    return this.empresasService.criarEmpresa(criarEmpresaDto);
  }

  @Patch(':id') 
  alterarEmpresa(
    @Param('id', ParseIntPipe) id: number, 
    @Body() alterarEmpresaDto: AlterarEmpresaDto,
  ): Promise<Empresa> {
    return this.empresasService.alterarEmpresa(id, alterarEmpresaDto);
  }


  @Get(':id') 
  buscarEmpresaPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Empresa> { 
    return this.empresasService.buscarEmpresaPorId(id);
  }
}