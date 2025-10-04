import axios from "axios";
import type { Usuario, RespostaAPI } from "../utils/types";

const apiClient = axios.create({
  baseURL: "localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTodosUsuarios = () =>
  apiClient.get<RespostaAPI<Usuario[]>>("/usuarios");

export const getUsuarioPorId = (id: number) =>
  apiClient.get<RespostaAPI<Usuario>>(`/usuarios/${id}`);

export const criarUsuario = (data: { nome: string; email: string }) =>
  apiClient.post<RespostaAPI<Usuario>>("/usuarios", data);

export const atualizarUsuario = (
  id: number,
  data: { nome?: string; email?: string }
) => apiClient.put<RespostaAPI<Usuario>>(`/usuarios/${id}`, data);

export const deletarUsuario = (id: number) =>
  apiClient.delete<RespostaAPI<Usuario>>(`/usuarios/${id}`);