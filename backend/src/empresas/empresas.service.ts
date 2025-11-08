import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger, // Já estava
  BadRequestException, // Já estava
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "src/prisma.service";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto";
import { Empresa } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { AlterarEmpresaDto } from "./dto/alterar-empresa.dto";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class EmpresasServices {
  private readonly logger = new Logger(EmpresasServices.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService
  ) {}

  // A SUA FUNÇÃO (está perfeita, sem alterações)
  private async _getCoordenadasFromAddress(
    enderecoInfo: any
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const endereco = `${enderecoInfo.logradouro}, ${enderecoInfo.numero}, ${enderecoInfo.bairro}, ${enderecoInfo.cidade}, ${enderecoInfo.cep}`;

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURI(
        endereco
      )}&format=json&limit=1`;

      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: { "User-Agent": "Rydex-API/1.0" },
        })
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
        error.stack
      );
      throw new BadRequestException(
        `Falha ao buscar coordenadas para o endereço fornecido. Erro: ${error.message}`
      );
    }
    throw new BadRequestException(
      "Endereço não encontrado ou inválido. Não foi possível obter as coordenadas."
    );
  }

  async criarEmpresa(criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    // CORREÇÃO 1: Validar senha (REINTEGRADO)
    if (criarEmpresaDto.senha !== criarEmpresaDto.confirmar_senha) {
      throw new BadRequestException("As senhas não conferem.");
    }

    // Hash da senha (como você fez)
    const salt = 10;
    criarEmpresaDto.senha = await bcrypt.hash(criarEmpresaDto.senha, salt);

    // Geocodificação (como você fez)
    const { latitude, longitude } =
      await this._getCoordenadasFromAddress(criarEmpresaDto);

    try {
      // CORREÇÃO 2: Remover confirmar_senha (REINTEGRADO)
      const { confirmar_senha, ...dadosParaCriar } = criarEmpresaDto;

      return await this.prismaService.empresa.create({
        data: {
          ...dadosParaCriar, // Usamos os dados limpos
          latitude: latitude,
          longitude: longitude,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("cnpj")) {
          throw new ConflictException("O CNPJ informado já está em uso.");
        }
        if (target.includes("email")) {
          throw new ConflictException("O Email informado já está em uso.");
        }
      }
      throw error;
    }
  }

  async alterarEmpresa(
    id: number,
    alterarEmpresaDto: AlterarEmpresaDto
  ): Promise<Empresa> {
    const dadosParaAtualizar: any = { ...alterarEmpresaDto };

    // CORREÇÃO 1: Validar senha (REINTEGRADO)
    if (alterarEmpresaDto.senha) {
      if (alterarEmpresaDto.senha !== alterarEmpresaDto.confirmar_senha) {
        throw new BadRequestException("As senhas não conferem.");
      }
      // Hash (como você fez)
      const salt = 10;
      dadosParaAtualizar.senha = await bcrypt.hash(
        alterarEmpresaDto.senha,
        salt
      );
    }

    // Lógica de Geocodificação (a sua lógica, está perfeita)
    const chavesEndereco = ["logradouro", "numero", "bairro", "cidade", "cep"];
    const enderecoMudou = chavesEndereco.some(
      (key) => alterarEmpresaDto[key] !== undefined
    );

    if (enderecoMudou) {
      this.logger.log(
        `Endereço da Empresa ID ${id} mudou. Re-geocodificando...`
      );

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
        dadosCompletosEndereco
      );
      dadosParaAtualizar.latitude = latitude;
      dadosParaAtualizar.longitude = longitude;
    }

    // CORREÇÃO 2: Remover confirmar_senha (REINTEGRADO)
    // Usamos delete aqui pois 'dadosParaAtualizar' já é 'any'
    if (dadosParaAtualizar.confirmar_senha) {
      delete dadosParaAtualizar.confirmar_senha;
    }

    try {
      return await this.prismaService.empresa.update({
        where: { id: id },
        data: dadosParaAtualizar,
      });
    } catch (error) {
      //... (seu tratamento de erro está ótimo)
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("email")) {
            throw new ConflictException("O Email informado já está em uso.");
          }
        }
        if (error.code === "P2025") {
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
    const { senha, ...empresaSemSenha } = empresa;

    return empresaSemSenha as Empresa;
  }

  async adicionarSaldo(id: number, valor: number): Promise<Empresa> {
    try {
      const empresaAtualizada = await this.prismaService.empresa.update({
        where: { id: id },
        data: {
          saldo: {
            increment: valor,
          },
        },
      });

      const { senha, ...empresaSemSenha } = empresaAtualizada;
      return empresaSemSenha as Empresa;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
      }
      throw error;
    }
  }

  async removerSaldo(id: number, valor: number): Promise<Empresa> {
    try {
      const empresaAtualizada = await this.prismaService.empresa.update({
        where: {
          id: id,
          saldo: {
            gte: valor,
          },
        },
        data: {
          saldo: {
            decrement: valor,
          },
        },
      });

      const { senha, ...empresaSemSenha } = empresaAtualizada;
      return empresaSemSenha as Empresa;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        const empresaExiste = await this.prismaService.empresa.findUnique({
          where: { id: id },
        });

        if (!empresaExiste) {
          throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
        }
        throw new BadRequestException(
          "Saldo insuficiente para realizar a operação."
        );
      }
      throw error;
    }
  }
  async removerEmpresa(id: number): Promise<void> {
    try {
      await this.prismaService.empresa.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
      }
      throw error;
    }
  }
}
