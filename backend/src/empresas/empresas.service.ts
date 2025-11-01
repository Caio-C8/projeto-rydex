import {
  Injectable,
  ConflictException,
  NotFoundException, 
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma.service';
import { CriarEmpresaDto } from './dto/criar-empresa.dto';
import { Empresa } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AlterarEmpresaDto } from './dto/alterar-empresa.dto'; 

@Injectable()
export class EmpresasServices {
  constructor(private readonly prismaService: PrismaService) {}

  async criarEmpresa(criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    try {
      const salt = 10;
      criarEmpresaDto.senha = await bcrypt.hash(criarEmpresaDto.senha, salt);

      return await this.prismaService.empresa.create({
        data: criarEmpresaDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('cnpj')) {
          throw new ConflictException('O CNPJ informado já está em uso.');
        }
        if (target.includes('email')) {
          throw new ConflictException('O Email informado já está em uso.');
        }
      }
      throw error;
    }
  }

  

  async alterarEmpresa(
    id: number,
    alterarEmpresaDto: AlterarEmpresaDto,
  ): Promise<Empresa> {
    if (alterarEmpresaDto.senha) {
      const salt = 10;
      alterarEmpresaDto.senha = await bcrypt.hash(alterarEmpresaDto.senha, salt);
    }

    try {
      return await this.prismaService.empresa.update({
        where: { id: id }, 
        data: alterarEmpresaDto, 
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('email')) {
            throw new ConflictException('O Email informado já está em uso.');
          }
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
        }
      }
      throw error;
    }
  }

  async buscarEmpresaPorId(id: number): Promise<Empresa> {
    const empresa = await this.prismaService.empresa.findUnique({
      where: { id: id },
    });
    if (!empresa) {
      
      throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
    }
    return empresa;
  }

}