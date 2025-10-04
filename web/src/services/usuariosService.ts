import axios from "axios";
import type { Usuario, RespostaApi } from "../utils/types";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTodosUsuarios = () =>
  apiClient.get<RespostaApi<Usuario[]>>("/usuarios");

export const getUsuarioPorId = (id: number) =>
  apiClient.get<RespostaApi<Usuario>>(`/usuarios/${id}`);

export const criarUsuario = (data: { nome: string; email: string }) =>
  apiClient.post<RespostaApi<Usuario>>("/usuarios", data);

export const atualizarUsuario = (
  id: number,
  data: { nome?: string; email?: string }
) => apiClient.put<RespostaApi<Usuario>>(`/usuarios/${id}`, data);

export const deletarUsuario = (id: number) =>
  apiClient.delete<RespostaApi<Usuario>>(`/usuarios/${id}`);
