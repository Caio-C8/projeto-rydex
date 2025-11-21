import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "src/prisma.service";
import { CriarEmpresaDto } from "./dto/criar-empresa.dto";
import { Empresa } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { AlterarEmpresaDto } from "./dto/alterar-empresa.dto";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { RedefinirSenhaDto } from "./dto/redefinir-senha.dto";

@Injectable()
export class EmpresasServices {
  private readonly logger = new Logger(EmpresasServices.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private configService: ConfigService
  ) {}

  private async getCoordenadas(
    enderecoInfo: any
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const apiKey = this.configService.get<string>("GOOGLE_MAPS_API_KEY");

      if (!apiKey) {
        throw new Error("Chave GOOGLE_MAPS_API_KEY não configurada.");
      }

      const endereco = `${enderecoInfo.logradouro}, ${enderecoInfo.numero}, ${enderecoInfo.bairro}, ${enderecoInfo.cidade}, ${enderecoInfo.cep}`;

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        endereco
      )}&key=${apiKey}`;

      const { data } = await firstValueFrom(this.httpService.get(url));

      if (
        data &&
        data.status === "OK" &&
        data.results &&
        data.results.length > 0
      ) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else if (data && data.status === "ZERO_RESULTS") {
        throw new NotFoundException(
          "Endereço não encontrado ou inválido. Não foi possível obter as coordenadas."
        );
      }

      const errorMessage =
        data?.error_message ||
        `Erro desconhecido da API do Google Maps: Status ${data?.status}`;
      throw new Error(errorMessage);
    } catch (error) {
      this.logger.error(
        `Falha ao geocodificar endereço: ${error.message}`,
        error.stack
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Falha ao buscar coordenadas para o endereço fornecido. Verifique o endereço. Detalhes: ${error.message}`
      );
    }
  }

  async criarEmpresa(criarEmpresaDto: CriarEmpresaDto): Promise<Empresa> {
    // 1. Validação de Senha (Regra de Negócio)
    if (criarEmpresaDto.senha !== criarEmpresaDto.confirmar_senha) {
      throw new BadRequestException("As senhas digitadas não conferem.");
    }

    // 2. Criptografia da Senha
    try {
      const salt = 10;
      criarEmpresaDto.senha = await bcrypt.hash(criarEmpresaDto.senha, salt);
    } catch (error) {
      this.logger.error("Erro ao gerar hash da senha", error);
      throw new InternalServerErrorException("Erro de segurança ao processar a senha.");
    }

    // 3. Geocodificação (Google Maps)
    // O método getCoordenadas já lança erros específicos (NotFound/BadRequest),
    // então aqui vamos capturar apenas erros inesperados da API (ex: timeout, chave inválida).
    let latitude: number;
    let longitude: number;

    try {
      const coords = await this.getCoordenadas(criarEmpresaDto);
      latitude = coords.latitude;
      longitude = coords.longitude;
    } catch (error) {
      // Se for um erro de validação que nós mesmos lançamos no getCoordenadas, repassa pro front
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // Se for erro técnico (API fora do ar, etc), loga e avisa
      this.logger.error("Falha crítica na API de Mapas", error);
      throw new InternalServerErrorException(
        "Não foi possível validar o endereço. Verifique se o CEP e número estão corretos."
      );
    }

    // 4. Salvar no Banco de Dados
    try {
      // Remove o campo confirmar_senha que não vai para o banco
      const { confirmar_senha, ...dadosParaCriar } = criarEmpresaDto;

      return await this.prismaService.empresa.create({
        data: {
          ...dadosParaCriar,
          latitude: latitude,
          longitude: longitude,
        },
      });

    } catch (error) {
      // Tratamento de Duplicidade (Erro P2002 do Prisma)
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        
        if (target.includes("cnpj")) {
          throw new ConflictException("Este CNPJ já está cadastrado em nosso sistema.");
        }
        if (target.includes("email")) {
          throw new ConflictException("Este e-mail já possui uma conta associada.");
        }
        
        // Fallback para outros campos únicos
        throw new ConflictException("Já existe um registro com estes dados (Email ou CNPJ).");
      }

      // Erros genéricos de banco (Conexão caiu, tabela não existe, etc)
      this.logger.error("Erro crítico ao salvar empresa no banco", error);
      throw new InternalServerErrorException(
        "Falha ao registrar a empresa no banco de dados. Por favor, tente novamente mais tarde."
      );
    }
  }
  async alterarEmpresa(
    id: number,
    alterarEmpresaDto: AlterarEmpresaDto
  ): Promise<Empresa> {
    const dadosParaAtualizar: any = { ...alterarEmpresaDto };

    if (alterarEmpresaDto.senha) {
      if (alterarEmpresaDto.senha !== alterarEmpresaDto.confirmar_senha) {
        throw new BadRequestException("As senhas não conferem.");
      }

      const salt = 10;
      dadosParaAtualizar.senha = await bcrypt.hash(
        alterarEmpresaDto.senha,
        salt
      );
    }

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

      const { latitude, longitude } = await this.getCoordenadas(
        dadosCompletosEndereco
      );

      dadosParaAtualizar.latitude = latitude;
      dadosParaAtualizar.longitude = longitude;
    }

    if (dadosParaAtualizar.confirmar_senha) {
      delete dadosParaAtualizar.confirmar_senha;
    }

    try {
      return await this.prismaService.empresa.update({
        where: { id: id },
        data: dadosParaAtualizar,
      });
    } catch (error) {
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

  async redefinirSenha(dto: RedefinirSenhaDto): Promise<String> {
    const { email, nova_senha, confirmar_senha } = dto;

    if (nova_senha !== confirmar_senha) {
      throw new BadRequestException("As senhas não conferem.");
    }

    const empresa = await this.prismaService.empresa.findUnique({
      where: { email },
    });

    if (!empresa) {
      throw new NotFoundException(
        "Dados inválidos. Verifique o E-mail e o CNPJ informados."
      );
    }

    const salt = 10;
    const novaSenhaHash = await bcrypt.hash(nova_senha, salt);

    await this.prismaService.empresa.update({
      where: { id: empresa.id },
      data: { senha: novaSenhaHash },
    });

    return "Senha alterada.";
  }
}
