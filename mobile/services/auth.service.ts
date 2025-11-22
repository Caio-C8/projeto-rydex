import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import {
  RespostaSucesso,
  LoginResponse,
  UsuarioLogin,
} from "../types/api.types";
import { LoginDto } from "../types/dtos";

export const authService = {
  /**
   * Realiza o login.
   * Nota: O mobile força o tipo 'entregador' automaticamente.
   */
  login: async (email: string, senha: string): Promise<LoginResponse> => {
    const payload: LoginDto = {
      email,
      senha,
      tipo: "entregador",
    };

    const { data } = await api.post<RespostaSucesso<LoginResponse>>(
      "/auth/login",
      payload
    );

    if (data.sucesso && data.dados.access_token) {
      await AsyncStorage.setItem("user_token", data.dados.access_token);
      // Salva o objeto usuario (com camelCase no ultimaAtualizacaoLocalizacao)
      await AsyncStorage.setItem(
        "user_data",
        JSON.stringify(data.dados.usuario)
      );
    }

    return data.dados;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(["user_token", "user_data"]);
  },

  getUsuarioLogado: async (): Promise<UsuarioLogin | null> => {
    const json = await AsyncStorage.getItem("user_data");
    return json ? JSON.parse(json) : null;
  },
};
