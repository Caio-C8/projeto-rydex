import {
  Injectable,
  ConflictException,
  NotFoundException, 
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma.service';
import { CriarEmpresaDto } from './dto/criar-empresa.dto';
import { Empresa } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AlterarEmpresaDto } from './dto/alterar-empresa.dto'; 
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmpresasServices {
  private readonly logger = new Logger(EmpresasServices.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,

  ) {}
private async _getCoordenadasFromAddress(
    enderecoInfo: any,
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const endereco = `${enderecoInfo.logradouro}, ${enderecoInfo.numero}, ${enderecoInfo.bairro}, ${enderecoInfo.cidade}, ${enderecoInfo.cep}`;

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURI(
        endereco,
      )}&format=json&limit=1`;

      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Rydex-API/1.0' },
        }),
      );

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      this.logger.error(
        `Falha ao geocodificar endereço: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Falha ao buscar coordenadas para o endereço fornecido. Erro: ${error.message}`,
      );
    }
    throw new BadRequestException(
      'Endereço não encontrado ou inválido. Não foi possível obter as coordenadas.',
    );
  }

async criarEmpresa(criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    const salt = 10;
    criarEmpresaDto.senha = await bcrypt.hash(criarEmpresaDto.senha, salt);

    const { latitude, longitude } =
      await this._getCoordenadasFromAddress(criarEmpresaDto);
    try {
      return await this.prismaService.empresa.create({
        data: {
          ...criarEmpresaDto,
          latitude: latitude, 
          longitude: longitude,
        },
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
    const dadosParaAtualizar: any = { ...alterarEmpresaDto };
    if (alterarEmpresaDto.senha) {
      const salt = 10;
      dadosParaAtualizar.senha = await bcrypt.hash(
        alterarEmpresaDto.senha,
        salt,
      );
    }

    const chavesEndereco = ['logradouro', 'numero', 'bairro', 'cidade', 'cep'];
    
    const enderecoMudou = chavesEndereco.some(
      (key) => alterarEmpresaDto[key] !== undefined,
    );

    if (enderecoMudou) {
      this.logger.log(`Endereço da Empresa ID ${id} mudou. Re-geocodificando...`);
      
      const empresaAtual = await this.prismaService.empresa.findUnique({
        where: { id },
      });

      if (!empresaAtual) {
        throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
      }

      const dadosCompletosEndereco = {
        logradouro: alterarEmpresaDto.logradouro ?? empresaAtual.logradouro,
        numero: alterarEmpresaDto.numero ?? empresaAtual.numero,
        bairro: alterarEmpresaDto.bairro ?? empresaAtual.bairro,
        cidade: alterarEmpresaDto.cidade ?? empresaAtual.cidade,
        cep: alterarEmpresaDto.cep ?? empresaAtual.cep,
      };

      const { latitude, longitude } = await this._getCoordenadasFromAddress(
        dadosCompletosEndereco,
      );

      dadosParaAtualizar.latitude = latitude;
      dadosParaAtualizar.longitude = longitude;
    }

    try {
      return await this.prismaService.empresa.update({
        where: { id: id },
        data: dadosParaAtualizar, 
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('cnpj')) {
            throw new ConflictException('O CNPJ informado já está em uso.');
          }
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