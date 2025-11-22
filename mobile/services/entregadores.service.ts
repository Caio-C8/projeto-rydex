import { api } from "./api";
import { RespostaSucesso, EntregadorPerfil, Arquivo } from "../types/api.types";
import {
  CriarEntregadorDto,
  AlterarEntregadorDto,
  RedefinirSenhaDto,
  AtualizarLocalizacaoDto,
  TransacaoSaldoDto,
  ImageFile,
} from "../types/dtos";

export const entregadoresService = {
  buscarMeusDados: async (): Promise<EntregadorPerfil> => {
    const { data } = await api.get<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores/me"
    );
    return data.dados;
  },

  buscarMeusArquivos: async (): Promise<Arquivo[]> => {
    const { data } = await api.get<RespostaSucesso<Arquivo[]>>(
      "/entregadores/me/arquivos"
    );
    return data.dados;
  },

  statusOnline: async (): Promise<EntregadorPerfil> => {
    const { data } = await api.patch<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores/status/online"
    );
    return data.dados;
  },

  statusOffline: async (): Promise<EntregadorPerfil> => {
    const { data } = await api.patch<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores/status/offline"
    );
    return data.dados;
  },

  atualizarLocalizacao: async (
    coords: AtualizarLocalizacaoDto
  ): Promise<void> => {
    // O backend retorna { mensagem: string }, não precisamos tratar o retorno
    await api.patch("/entregadores/localizacao", coords);
  },

  adicionarSaldo: async (valorCentavos: number): Promise<EntregadorPerfil> => {
    const payload: TransacaoSaldoDto = { valor: valorCentavos };
    const { data } = await api.post<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores/saldo/adicionar",
      payload
    );
    return data.dados;
  },

  retirarSaldo: async (valorCentavos: number): Promise<EntregadorPerfil> => {
    const payload: TransacaoSaldoDto = { valor: valorCentavos };
    const { data } = await api.post<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores/saldo/retirar",
      payload
    );
    return data.dados;
  },

  redefinirSenha: async (dto: RedefinirSenhaDto): Promise<string> => {
    // O backend retorna string simples ("Senha alterada.") ou 204 No Content
    const { data } = await api.patch<RespostaSucesso<string>>(
      "/entregadores/recuperacao-senha",
      dto
    );
    return data.dados; // ou data.mensagem dependendo de como o backend serializa strings soltas
  },

  // ===========================================================
  // CADASTRO (MULTIPART)
  // ===========================================================

  criarEntregador: async (
    dados: CriarEntregadorDto,
    cnh?: ImageFile,
    docVeiculo?: ImageFile
  ): Promise<EntregadorPerfil> => {
    const formData = new FormData();

    // Campos obrigatórios do DTO
    formData.append("nome", dados.nome);
    formData.append("email", dados.email);
    formData.append("cpf", dados.cpf);
    formData.append("senha", dados.senha);
    formData.append("confirmar_senha", dados.confirmar_senha); // Novo campo exigido
    formData.append("celular", dados.celular);
    formData.append("dataNascimento", dados.dataNascimento);
    formData.append("placaVeiculo", dados.placaVeiculo);
    formData.append("chavePix", dados.chavePix);

    // Campos opcionais
    if (dados.latitude) formData.append("latitude", String(dados.latitude));
    if (dados.longitude) formData.append("longitude", String(dados.longitude));

    // Arquivos
    if (cnh) {
      formData.append("imagemCnh", {
        uri: cnh.uri,
        name: cnh.name,
        type: cnh.type,
      } as any);
    }

    if (docVeiculo) {
      formData.append("imagemDocVeiculo", {
        uri: docVeiculo.uri,
        name: docVeiculo.name,
        type: docVeiculo.type,
      } as any);
    }

    const { data } = await api.post<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data.dados;
  },

  // ===========================================================
  // ATUALIZAR PERFIL (MULTIPART)
  // ===========================================================

  atualizarPerfil: async (
    dados: AlterarEntregadorDto,
    cnh?: ImageFile,
    docVeiculo?: ImageFile
  ): Promise<EntregadorPerfil> => {
    const formData = new FormData();

    // Adiciona apenas campos definidos
    if (dados.nome) formData.append("nome", dados.nome);
    if (dados.email) formData.append("email", dados.email);
    if (dados.senha) formData.append("senha", dados.senha);
    if (dados.celular) formData.append("celular", dados.celular);
    if (dados.dataNascimento)
      formData.append("dataNascimento", dados.dataNascimento);
    if (dados.placaVeiculo) formData.append("placaVeiculo", dados.placaVeiculo);
    if (dados.chavePix) formData.append("chavePix", dados.chavePix);

    if (cnh) {
      formData.append("imagemCnh", {
        uri: cnh.uri,
        name: cnh.name || "cnh.jpg",
        type: cnh.type || "image/jpeg",
      } as any);
    }

    if (docVeiculo) {
      formData.append("imagemDocVeiculo", {
        uri: docVeiculo.uri,
        name: docVeiculo.name || "doc.jpg",
        type: docVeiculo.type || "image/jpeg",
      } as any);
    }

    const { data } = await api.patch<RespostaSucesso<EntregadorPerfil>>(
      "/entregadores/perfil",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data.dados;
  },
};
