import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Entregador, Arquivos, Prisma } from "@prisma/client";

import * as fs from "fs/promises";
import * as path from "path";
import { posix } from "path";

import { PrismaService } from "src/prisma.service";

import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { RespostaArquivosDto } from "./dto/resposta-arquivos.dto";

@Injectable()
export class EntregadoresService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarEntregadores(): Promise<
    (Entregador & { arquivos: Arquivos[] })[]
  > {
    return await this.prisma.entregador.findMany({
      include: {
        arquivos: true,
      },
    });
  }

  async buscarEntregador(
    id: number
  ): Promise<Entregador & { arquivos: Arquivos[] }> {
    const entregador = await this.prisma.entregador.findUnique({
      where: {
        id: id,
      },
      include: {
        arquivos: true,
      },
    });

    if (!entregador) {
      throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
    }

    return entregador;
  }

  async buscarArquivos(id: number): Promise<RespostaArquivosDto[]> {
    const entregador = await this.prisma.entregador.count({
      where: {
        id: id,
      },
    });

    if (entregador === 0) {
      throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
    }

    return await this.prisma.arquivos.findMany({
      where: {
        entregador_id: id,
      },
    });
  }

  async criarEntregador(
    criarEntregadorDto: CriarEntregadorDto,
    imagemCnh?: Express.Multer.File,
    imagemDocVeiculo?: Express.Multer.File
  ): Promise<Entregador & { arquivos: Arquivos[] }> {
    return this.prisma.$transaction(async (prisma) => {
      const novoEntregador = await prisma.entregador.create({
        data: {
          nome: criarEntregadorDto.nome,
          data_nascimento: new Date(criarEntregadorDto.dataNascimento),
          cpf: criarEntregadorDto.cpf,
          email: criarEntregadorDto.email,
          senha: criarEntregadorDto.senha,
          celular: criarEntregadorDto.celular,
          placa_veiculo: criarEntregadorDto.placaVeiculo,
          chave_pix: criarEntregadorDto.chavePix,
        },
      });

      if (imagemCnh) {
        await this.salvarArquivo(prisma, novoEntregador, imagemCnh, "cnh");
      }

      if (imagemDocVeiculo) {
        await this.salvarArquivo(
          prisma,
          novoEntregador,
          imagemDocVeiculo,
          "docVeiculo"
        );
      }

      const entregadorCompleto = await prisma.entregador.findUnique({
        where: { id: novoEntregador.id },
        include: {
          arquivos: true,
        },
      });

      if (!entregadorCompleto) {
        throw new Error("Falha ao buscar entregador recém-criado.");
      }

      return entregadorCompleto;
    });
  }

  async alterarEntregador(
    id: number,
    alterarEntregadorDto: AlterarEntregadorDto,
    imagemCnh?: Express.Multer.File,
    imagemDocVeiculo?: Express.Multer.File
  ): Promise<Entregador & { arquivos: Arquivos[] }> {
    return this.prisma.$transaction(async (prisma) => {
      const entregador = await prisma.entregador.findUnique({
        where: { id },
      });

      if (!entregador) {
        throw new NotFoundException(
          `Entregador com o ID ${id} não encontrado.`
        );
      }

      const entregadorAtualizado = await prisma.entregador.update({
        where: { id },
        data: {
          nome: alterarEntregadorDto.nome,
          data_nascimento: alterarEntregadorDto.dataNascimento
            ? new Date(alterarEntregadorDto.dataNascimento)
            : undefined,
          cpf: alterarEntregadorDto.cpf,
          email: alterarEntregadorDto.email,
          senha: alterarEntregadorDto.senha,
          celular: alterarEntregadorDto.celular,
          placa_veiculo: alterarEntregadorDto.placaVeiculo,
          chave_pix: alterarEntregadorDto.chavePix,
        },
      });

      if (imagemCnh) {
        await this.atualizarArquivo(
          prisma,
          entregadorAtualizado,
          imagemCnh,
          "cnh"
        );
      }

      if (imagemDocVeiculo) {
        await this.atualizarArquivo(
          prisma,
          entregadorAtualizado,
          imagemDocVeiculo,
          "doc_veiculo"
        );
      }

      const entregadorCompleto = await prisma.entregador.findUnique({
        where: { id },
        include: {
          arquivos: true,
        },
      });

      if (!entregadorCompleto) {
        throw new Error("Falha buscar entregador após atualização.");
      }

      return entregadorCompleto;
    });
  }

  private async salvarArquivo(
    prisma: Prisma.TransactionClient,
    entregador: Entregador,
    arquivo: Express.Multer.File,
    tipoArquivo: string
  ): Promise<Arquivos> {
    const { nome, caminho } = await this.gravarArquivoDisco(
      entregador,
      arquivo,
      tipoArquivo
    );

    return prisma.arquivos.create({
      data: {
        nome: nome,
        caminho: caminho,
        entregador_id: entregador.id,
      },
    });
  }

  private async atualizarArquivo(
    prisma: Prisma.TransactionClient,
    entregador: Entregador,
    arquivoNovo: Express.Multer.File,
    tipoArquivo: string
  ) {
    const arquivoAntigo = await prisma.arquivos.findFirst({
      where: {
        entregador_id: entregador.id,
        nome: {
          startsWith: `${tipoArquivo}_`,
        },
      },
    });

    const { nome: nomeArquivoNovo, caminho: caminhoUrlDbNovo } =
      await this.gravarArquivoDisco(entregador, arquivoNovo, tipoArquivo);

    if (arquivoAntigo) {
      const caminhoAntigoFs = path.join("uploads", arquivoAntigo.caminho);
      try {
        await fs.unlink(caminhoAntigoFs);
      } catch (error) {
        console.warn(
          `Falha ao apagar arquivo antigo: ${caminhoAntigoFs}`,
          error.message
        );
      }

      await prisma.arquivos.update({
        where: { id: arquivoAntigo.id },
        data: {
          nome: nomeArquivoNovo,
          caminho: caminhoUrlDbNovo,
        },
      });
    } else {
      await prisma.arquivos.create({
        data: {
          nome: nomeArquivoNovo,
          caminho: caminhoUrlDbNovo,
          entregador_id: entregador.id,
        },
      });
    }
  }

  private async gravarArquivoDisco(
    entregador: Entregador,
    arquivo: Express.Multer.File,
    tipoArquivo: string
  ): Promise<{ nome: string; caminho: string }> {
    const diretorioDestinoFs = path.join("uploads", "entregadores");
    const diretorioDestinoUrl = "entregadores";

    await fs.mkdir(diretorioDestinoFs, { recursive: true });

    const nomeSanitizado = entregador.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]/g, " ")
      .trim()
      .replace(/\s+/g, "_");

    const extensao = path.extname(arquivo.originalname);
    const nomeArquivo = `${tipoArquivo}_${entregador.id}_${nomeSanitizado}_${Date.now()}${extensao}`;
    const caminhoCompletoFs = path.join(diretorioDestinoFs, nomeArquivo);
    const caminhoUrlDb = posix.join(diretorioDestinoUrl, nomeArquivo);

    await fs.writeFile(caminhoCompletoFs, arquivo.buffer);

    return { nome: nomeArquivo, caminho: caminhoUrlDb };
  }
}
