import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { PrismaClient } from "@prisma/client";
import { Entregador, Arquivos, Prisma } from "@prisma/client";

import * as fs from "fs/promises";
import * as path from "path";
import { posix } from "path";

import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { RespostaImagemDto } from "./dto/resposta-imagem.dto";

@Injectable()
export class EntregadoresService {
  constructor(private readonly prisma: PrismaService) {}

  // async buscarEntregadores(): Promise<Entregador[]> {
  //   return await this.prisma.entregador.findMany();
  // }

  // async buscarEntregador(id: number): Promise<Entregador> {
  //   const entregador = await this.prisma.entregador.findUnique({
  //     where: {
  //       id: id,
  //     },
  //   });

  //   if (!entregador) {
  //     throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
  //   }

  //   return entregador;
  // }

  // async buscarImagens(id: number): Promise<RespostaImagemDto[]> {
  //   const imagensDoBanco = await this.prisma.imagens.findMany({
  //     where: {
  //       entregador_id: id,
  //     },
  //   });

  //   const imagensFormatadas: RespostaImagemDto[] = imagensDoBanco.map(
  //     (imagem) => {
  //       return {
  //         id: imagem.id,
  //         nome_imagem: imagem.nome_imagem,
  //         conteudo: imagem.conteudo
  //           ? Buffer.from(imagem.conteudo).toString("base64")
  //           : null,
  //         entregador_id: imagem.entregador_id,
  //       };
  //     }
  //   );

  //   return imagensFormatadas;
  // }

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

  private async salvarArquivo(
    prisma: Prisma.TransactionClient,
    entregador: Entregador,
    arquivo: Express.Multer.File,
    tipoArquivo: string
  ): Promise<Arquivos> {
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

    return prisma.arquivos.create({
      data: {
        nome: nomeArquivo,
        caminho: caminhoUrlDb,
        entregador_id: entregador.id,
      },
    });
  }

  // async alterarEntregador(
  //   id: number,
  //   alterarEntregadorDto: AlterarEntregadorDto,
  //   imagens: Array<Express.Multer.File>
  // ): Promise<Entregador> {
  //   return this.prisma.$transaction(async (prisma) => {
  //     const entregadorExistente = await prisma.entregador.findUnique({
  //       where: { id },
  //     });

  //     if (!entregadorExistente) {
  //       throw new NotFoundException(
  //         `Entregador com o ID ${id} não encontrado.`
  //       );
  //     }

  //     const { idsImagensParaSubstituir, ...dadosEntregador } =
  //       alterarEntregadorDto;
  //     const entregadorAtualizado = await prisma.entregador.update({
  //       where: { id },
  //       data: {
  //         ...dadosEntregador,
  //         placa_veiculo: alterarEntregadorDto.placaVeiculo,
  //         data_nascimento: alterarEntregadorDto.dataNascimento
  //           ? new Date(alterarEntregadorDto.dataNascimento)
  //           : undefined,
  //       },
  //     });

  //     if (imagens && imagens.length > 0) {
  //       await this.processarAtualizacaoImagens(
  //         id,
  //         imagens,
  //         idsImagensParaSubstituir,
  //         prisma
  //       );
  //     }

  //     return entregadorAtualizado;
  //   });
  // }

  // // private async processarAtualizacaoImagens(
  // //   entregadorId: number,
  // //   imagens: Array<Express.Multer.File>,
  // //   idsImagensParaSubstituir: string | undefined,
  // //   prisma: Omit<
  // //     PrismaClient,
  // //     "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  // //   >
  // // ) {
  // //   if (!idsImagensParaSubstituir) {
  // //     throw new BadRequestException("Imagens não localizadas.");
  // //   }

  // //   const idsParaSubstituir = idsImagensParaSubstituir
  // //     .split(",")
  // //     .map((idStr) => parseInt(idStr.trim(), 10));

  // //   if (idsParaSubstituir.some(isNaN)) {
  // //     throw new BadRequestException("Erro ao processar dados.");
  // //   }

  // //   if (idsParaSubstituir.length !== imagens.length) {
  // //     throw new BadRequestException(
  // //       "O número de imagens fornecidas não corresponde ao número de imagens enviadas."
  // //     );
  // //   }

  // //   for (let i = 0; i < idsParaSubstituir.length; i++) {
  // //     const idImagem = idsParaSubstituir[i];
  // //     const novaImagem = imagens[i];

  // //     const imagemExistente = await prisma.imagens.findFirst({
  // //       where: {
  // //         id: idImagem,
  // //         entregador_id: entregadorId,
  // //       },
  // //     });

  // //     if (!imagemExistente) {
  // //       throw new NotFoundException(
  // //         `A imagem com ID ${idImagem} não foi encontrada ou não pertence a este entregador.`
  // //       );
  // //     }

  // //     await prisma.imagens.update({
  // //       where: { id: idImagem },
  // //       data: {
  // //         conteudo: novaImagem.buffer,
  // //         nome_imagem: novaImagem.originalname,
  // //       },
  // //     });
  // //   }
  // }
}
