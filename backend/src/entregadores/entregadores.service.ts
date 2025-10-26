import { Injectable, NotFoundException } from "@nestjs/common";
import { Entregador, Arquivos, Prisma } from "@prisma/client";

import * as fs from "fs/promises";
import * as path from "path";
import { posix } from "path";
import * as bcrypt from "bcrypt";

import { PrismaService } from "src/prisma.service";

import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { RespostaArquivosDto } from "./dto/resposta-arquivos.dto";
import { RespostaEntregadorDto } from "./dto/resposta-entregador.dto";

@Injectable()
export class EntregadoresService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarEntregadores(): Promise<RespostaEntregadorDto[]> {
    const entregadores = await this.prisma.entregador.findMany({
      include: {
        arquivos: true,
      },
    });

    const entregadoresSemSenha = entregadores.map((entregador) => {
      const { senha, ...entregadorSemSenha } = entregador;
      return entregadorSemSenha;
    });

    return entregadoresSemSenha;
  }

  async buscarEntregador(id: number): Promise<RespostaEntregadorDto> {
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

    const { senha, ...entregadorSemSenha } = entregador;

    return entregadorSemSenha;
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
  ): Promise<RespostaEntregadorDto> {
    const senhaCriptografada = await bcrypt.hash(criarEntregadorDto.senha, 10);

    return this.prisma.$transaction(async (prisma) => {
      const novoEntregador = await prisma.entregador.create({
        data: {
          nome: criarEntregadorDto.nome,
          data_nascimento: new Date(criarEntregadorDto.dataNascimento),
          cpf: criarEntregadorDto.cpf,
          email: criarEntregadorDto.email,
          senha: senhaCriptografada,
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
          "doc_veiculo"
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

      const { senha, ...entregadorSemSenha } = entregadorCompleto;

      return entregadorSemSenha;
    });
  }

  async alterarEntregador(
    id: number,
    alterarEntregadorDto: AlterarEntregadorDto,
    imagemCnh?: Express.Multer.File,
    imagemDocVeiculo?: Express.Multer.File
  ): Promise<RespostaEntregadorDto> {
    return this.prisma.$transaction(async (prisma) => {
      const entregador = await prisma.entregador.findUnique({
        where: { id },
      });

      if (!entregador) {
        throw new NotFoundException(
          `Entregador com o ID ${id} não encontrado.`
        );
      }

      const dadosParaAtualizar: Prisma.EntregadorUpdateInput = {
        nome: alterarEntregadorDto.nome,
        data_nascimento:
          alterarEntregadorDto.dataNascimento &&
          alterarEntregadorDto.dataNascimento.trim() !== ""
            ? new Date(alterarEntregadorDto.dataNascimento)
            : undefined,
        cpf: alterarEntregadorDto.cpf,
        email: alterarEntregadorDto.email,
        celular: alterarEntregadorDto.celular,
        placa_veiculo: alterarEntregadorDto.placaVeiculo,
        chave_pix: alterarEntregadorDto.chavePix,
      };

      if (alterarEntregadorDto.senha) {
        const senhaHash = await bcrypt.hash(alterarEntregadorDto.senha, 10);
        dadosParaAtualizar.senha = senhaHash;
      }

      const entregadorAtualizado = await prisma.entregador.update({
        where: { id },
        data: dadosParaAtualizar,
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

      const { senha, ...entregadorSemSenha } = entregadorCompleto;

      return entregadorSemSenha;
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
