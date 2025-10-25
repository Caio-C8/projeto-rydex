import { Body, Controller, Post, Get } from "@nestjs/common";
import { EmpresasServices } from "./empresas.service";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto";
import { Empresa } from "@prisma/client";
import { promises } from "dns";

@Controller("empresas")
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasServices) {}

  @Get()
  buscarEmpresas(): Promise<Empresa[]> {
    return this.empresasService.buscarEmpresas();
  }

  @Post()
  criarEmrpesa(@Body() criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    return this.empresasService.criarEmpresa(criarEmpresaDto);
  }
}
