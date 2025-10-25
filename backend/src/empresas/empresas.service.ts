import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto";
import { Empresa } from "@prisma/client";

@Injectable()
export class EmpresasServices {
  constructor(private readonly prismaService: PrismaService) {}

  async buscarEmpresas(): Promise<Empresa[]> {
    return await this.prismaService.empresa.findMany();
  }

  async criarEmpresa(criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    return await this.prismaService.empresa.create({
      data: criarEmpresaDto,
    });
  }
}
