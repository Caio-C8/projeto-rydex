import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  Entregador,
  Arquivos,
  StatusEntregadores,
  Prisma,
} from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";
import { posix } from "path";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma.service";
import { CriarEntregadorDto } from "./dto/criar-entregador.dto";
import { AlterarEntregadorDto } from "./dto/alterar-entregador.dto";
import { RespostaArquivosDto } from "./dto/resposta-arquivos.dto";
import { RespostaEntregadorDto } from "./dto/resposta-entregador.dto";
import { AtualizarLocalizacaoDto } from "./dto/atualizar-localizacao.dto";
import { RedefinirSenhaDto } from "./dto/redefinir-senha.dto";

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
    if (criarEntregadorDto.senha !== criarEntregadorDto.confirmar_senha) {
      throw new BadRequestException("As senhas não conferem.");
    }

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
          latitude: criarEntregadorDto.latitude,
          longitude: criarEntregadorDto.longitude,
        },
      });

      if (novoEntregador.latitude && novoEntregador.longitude) {
        await prisma.$executeRaw`
          UPDATE "entregadores"
          SET 
            "localizacao" = ST_SetSRID(ST_MakePoint(${novoEntregador.longitude}, ${novoEntregador.latitude}), 4326),
            "ultima_atualizacao_localizacao" = NOW()
          WHERE "id" = ${novoEntregador.id}
        `;
      }

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

      const nomeMudou =
        alterarEntregadorDto.nome &&
        alterarEntregadorDto.nome.trim() !== "" &&
        alterarEntregadorDto.nome !== entregador.nome;

      const dadosParaAtualizar: Prisma.EntregadorUpdateInput = {
        nome: alterarEntregadorDto.nome ? alterarEntregadorDto.nome : undefined,
        data_nascimento:
          alterarEntregadorDto.dataNascimento &&
          alterarEntregadorDto.dataNascimento.trim() !== ""
            ? new Date(alterarEntregadorDto.dataNascimento)
            : undefined,
        email: alterarEntregadorDto.email
          ? alterarEntregadorDto.email
          : undefined,
        celular: alterarEntregadorDto.celular
          ? alterarEntregadorDto.celular
          : undefined,
        placa_veiculo: alterarEntregadorDto.placaVeiculo
          ? alterarEntregadorDto.placaVeiculo
          : undefined,
        chave_pix: alterarEntregadorDto.chavePix
          ? alterarEntregadorDto.chavePix
          : undefined,
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

      if (nomeMudou) {
        if (!imagemCnh) {
          await this.renomearArquivo(prisma, entregadorAtualizado, "cnh");
        }

        if (!imagemDocVeiculo) {
          await this.renomearArquivo(
            prisma,
            entregadorAtualizado,
            "doc_veiculo"
          );
        }
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

  async adicionarSaldo(
    id: number,
    valor: number
  ): Promise<RespostaEntregadorDto> {
    const entregador = await this.prisma.entregador.findUnique({
      where: { id },
    });

    if (!entregador) {
      throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
    }

    const entregadorAtualizado = await this.prisma.entregador.update({
      where: { id },
      data: {
        saldo: {
          increment: valor,
        },
      },
      include: {
        arquivos: true,
      },
    });

    const { senha, ...entregadorSemSenha } = entregadorAtualizado;

    return entregadorSemSenha;
  }

  async retirarSaldo(
    id: number,
    valor: number
  ): Promise<RespostaEntregadorDto> {
    const entregador = await this.prisma.entregador.findUnique({
      where: { id },
    });

    if (!entregador) {
      throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
    }

    const valorMinimoRetirada = 2000;
    if (valor < valorMinimoRetirada) {
      throw new BadRequestException(
        `O valor mínimo para retirada é de R$ 20,00.`
      );
    }

    if (entregador.saldo < valor) {
      throw new BadRequestException("Saldo insuficiente para esta retirada.");
    }

    const entregadorAtualizado = await this.prisma.entregador.update({
      where: { id },
      data: {
        saldo: {
          decrement: valor,
        },
      },
      include: {
        arquivos: true,
      },
    });

    const { senha, ...entregadorSemSenha } = entregadorAtualizado;

    return entregadorSemSenha;
  }

  async definirStatusOnline(id: number): Promise<RespostaEntregadorDto> {
    const entregador = await this.prisma.entregador.findUnique({
      where: { id },
      include: {
        arquivos: true,
      },
    });

    if (!entregador) {
      throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
    }

    if (entregador.status === StatusEntregadores.em_entrega) {
      throw new BadRequestException(
        "Não é possível ficar online. O entregador está atualmente em entrega."
      );
    }

    if (entregador.status === StatusEntregadores.online) {
      const { senha, ...entregadorSemSenha } = entregador;
      return entregadorSemSenha;
    }

    const entregadorAtualizado = await this.prisma.entregador.update({
      where: { id },
      data: {
        status: StatusEntregadores.online,
      },
      include: {
        arquivos: true,
      },
    });

    const { senha, ...entregadorSemSenha } = entregadorAtualizado;
    return entregadorSemSenha;
  }

  async definirStatusOffline(id: number): Promise<RespostaEntregadorDto> {
    const entregador = await this.prisma.entregador.findUnique({
      where: { id },
      include: {
        arquivos: true,
      },
    });

    if (!entregador) {
      throw new NotFoundException(`Entregador com o ID ${id} não encontrado.`);
    }

    if (entregador.status === StatusEntregadores.em_entrega) {
      throw new BadRequestException(
        "Não é possível ficar offline. O entregador está atualmente em entrega."
      );
    }

    if (entregador.status === StatusEntregadores.offline) {
      const { senha, ...entregadorSemSenha } = entregador;
      return entregadorSemSenha;
    }

    const entregadorAtualizado = await this.prisma.entregador.update({
      where: { id },
      data: {
        status: StatusEntregadores.offline,
      },
      include: {
        arquivos: true,
      },
    });

    const { senha, ...entregadorSemSenha } = entregadorAtualizado;
    return entregadorSemSenha;
  }

  async atualizarLocalizacao(
    entregadorId: number,
    atualizarLocalizacaoDto: AtualizarLocalizacaoDto
  ): Promise<any> {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.entregador.update({
        where: { id: entregadorId },
        data: {
          latitude: atualizarLocalizacaoDto.latitude,
          longitude: atualizarLocalizacaoDto.longitude,
        },
      });

      await prisma.$executeRaw`
        UPDATE "entregadores"
        SET 
          "localizacao" = ST_SetSRID(ST_MakePoint(${atualizarLocalizacaoDto.longitude}, ${atualizarLocalizacaoDto.latitude}), 4326),
          "ultima_atualizacao_localizacao" = NOW()
        WHERE "id" = ${entregadorId}
      `;

      return { mensagem: "Localização atualizada." };
    });
  }

  async redefinirSenha(dto: RedefinirSenhaDto): Promise<String> {
    const { email, nova_senha, confirmar_senha } = dto;

    if (nova_senha !== confirmar_senha) {
      throw new BadRequestException("As senhas não conferem.");
    }

    const entregador = await this.prisma.entregador.findUnique({
      where: { email },
    });

    if (!entregador) {
      throw new NotFoundException(
        "Dados inválidos. Verifique o E-mail e o CPF informados."
      );
    }

    const salt = 10;
    const novaSenhaHash = await bcrypt.hash(nova_senha, salt);

    await this.prisma.entregador.update({
      where: { id: entregador.id },
      data: { senha: novaSenhaHash },
    });

    return "Senha alterada.";
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

    const nomeSanitizado = this.sanitizarNome(entregador.nome);

    const extensao = path.extname(arquivo.originalname);
    const nomeArquivo = `${tipoArquivo}_${entregador.id}_${nomeSanitizado}_${Date.now()}${extensao}`;
    const caminhoCompletoFs = path.join(diretorioDestinoFs, nomeArquivo);
    const caminhoUrlDb = posix.join(diretorioDestinoUrl, nomeArquivo);

    await fs.writeFile(caminhoCompletoFs, arquivo.buffer);

    return { nome: nomeArquivo, caminho: caminhoUrlDb };
  }

  private sanitizarNome(nome: string): string {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]/g, " ")
      .trim()
      .replace(/\s+/g, "_");
  }

  private async renomearArquivo(
    prisma: Prisma.TransactionClient,
    entregador: Entregador,
    tipoArquivo: "cnh" | "doc_veiculo"
  ) {
    const arquivoAntigo = await prisma.arquivos.findFirst({
      where: {
        entregador_id: entregador.id,
        nome: {
          startsWith: `${tipoArquivo}_`,
        },
      },
    });

    if (!arquivoAntigo) {
      return;
    }

    try {
      const extensao = path.extname(arquivoAntigo.nome);

      const nomePartes = arquivoAntigo.nome.replace(extensao, "").split("_");
      const timestamp = nomePartes[nomePartes.length - 1];

      if (!timestamp || isNaN(Number(timestamp))) {
        throw new Error(
          `Timestamp inválido ou não encontrado em ${arquivoAntigo.nome}`
        );
      }

      const nomeSanitizadoNovo = this.sanitizarNome(entregador.nome);
      const nomeArquivoNovo = `${tipoArquivo}_${entregador.id}_${nomeSanitizadoNovo}_${timestamp}${extensao}`;
      const caminhoUrlDbNovo = posix.join("entregadores", nomeArquivoNovo);

      const caminhoAntigoFs = path.join("uploads", arquivoAntigo.caminho);
      const caminhoNovoFs = path.join("uploads", caminhoUrlDbNovo);

      await fs.rename(caminhoAntigoFs, caminhoNovoFs);

      await prisma.arquivos.update({
        where: { id: arquivoAntigo.id },
        data: {
          nome: nomeArquivoNovo,
          caminho: caminhoUrlDbNovo,
        },
      });
    } catch (error) {
      console.error(
        `Falha ao renomear o arquivo ${arquivoAntigo.nome} para ${entregador.nome}`,
        error
      );
    }
  }
}
