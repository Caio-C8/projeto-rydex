import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";

import {
  getTodosUsuarios,
  atualizarUsuario,
  criarUsuario,
  deletarUsuario,
  getUsuarioPorId,
} from "../services/usuariosService";
import type { Usuario, RespostaApi } from "../utils/types";

export function useGetTodosUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string[] | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setErro(null);
      setMensagemSucesso(null);

      try {
        const response = await getTodosUsuarios();

        const respostaApi = response.data;

        if (respostaApi.sucesso && respostaApi.dados) {
          setUsuarios(respostaApi.dados);
          setMensagemSucesso(respostaApi.mensagem);
        }

        return respostaApi;
      } catch (error: any) {
        const axiosError = error as AxiosError<RespostaApi<null>>;

        const errosResponse = axiosError.response?.data?.erros || [
          "Ocorreu um erro inesperado.",
        ];

        setErro(errosResponse);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return { usuarios, loading, erro, mensagemSucesso };
}

export function useGetUsuarioPorId(id: number) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string[] | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setErro(null);
      setMensagemSucesso(null);

      try {
        const response = await getUsuarioPorId(id);

        const respostaApi = response.data;

        if (respostaApi.sucesso && respostaApi.dados) {
          setUsuario(respostaApi.dados);
          setMensagemSucesso(respostaApi.mensagem);
        }

        return respostaApi;
      } catch (error: any) {
        const axiosError = error as AxiosError<RespostaApi<null>>;

        const errosResponse = axiosError.response?.data?.erros || [
          "Ocorreu um erro inesperado.",
        ];

        setErro(errosResponse);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return { usuario, loading, erro, mensagemSucesso };
}

export function useCriarUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string[] | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const criar = useCallback(async (dados: { nome: string; email: string }) => {
    setLoading(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const resposta = await criarUsuario(dados);

      const respostaApi = resposta.data;

      if (respostaApi.sucesso && respostaApi.dados) {
        setUsuario(respostaApi.dados);
        setMensagemSucesso(respostaApi.mensagem);
      }

      return respostaApi;
    } catch (error: any) {
      const axiosError = error as AxiosError<RespostaApi<null>>;

      const errosResponse = axiosError.response?.data?.erros || [
        "Ocorreu um erro inesperado.",
      ];

      setErro(errosResponse);
    } finally {
      setLoading(false);
    }
  }, []);

  return { criar, usuario, loading, erro, mensagemSucesso };
}

export function useAtualizarUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string[] | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const atualizar = useCallback(
    async (id: number, dados: { nome?: string; email?: string }) => {
      setLoading(true);
      setErro(null);
      setMensagemSucesso(null);

      try {
        const resposta = await atualizarUsuario(id, dados);

        const respostaApi = resposta.data;

        if (respostaApi.sucesso && respostaApi.dados) {
          setUsuario(respostaApi.dados);
          setMensagemSucesso(respostaApi.mensagem);
        }

        return respostaApi;
      } catch (error: any) {
        const axiosError = error as AxiosError<RespostaApi<null>>;

        const errosResponse = axiosError.response?.data?.erros || [
          "Ocorreu um erro inesperado.",
        ];

        setErro(errosResponse);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { atualizar, usuario, loading, erro, mensagemSucesso };
}

export function useDeletarUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string[] | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const deletar = useCallback(async (id: number) => {
    setLoading(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const resposta = await deletarUsuario(id);

      const respostaApi = resposta.data;

      if (respostaApi.sucesso && respostaApi.dados) {
        setUsuario(respostaApi.dados);
        setMensagemSucesso(respostaApi.mensagem);
      }

      return respostaApi;
    } catch (error: any) {
      const axiosError = error as AxiosError<RespostaApi<null>>;

      const errosResponse = axiosError.response?.data?.erros || [
        "Ocorreu um erro inesperado.",
      ];

      setErro(errosResponse);
    } finally {
      setLoading(false);
    }
  }, []);

  return { deletar, usuario, loading, erro, mensagemSucesso };
}
