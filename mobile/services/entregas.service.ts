import { api } from "./api";
import { RespostaSucesso, Entrega } from "../types/api.types";

export const entregasService = {
  buscarMinhasEntregas: async (): Promise<Entrega[]> => {
    const { data } = await api.get<RespostaSucesso<Entrega[]>>("/entregas/me");
    return data.dados;
  },

  buscarEntregaPorId: async (id: number): Promise<Entrega> => {
    const { data } = await api.get<RespostaSucesso<Entrega>>(`/entregas/${id}`);
    return data.dados;
  },

  aceitarEntrega: async (
    idSolicitacao: number
  ): Promise<{ entrega: Entrega; empresaId: number }> => {
    const { data } = await api.post<
      RespostaSucesso<{ entrega: Entrega; empresaId: number }>
    >(`/entregas/${idSolicitacao}/aceitar`);
    return data.dados;
  },

  finalizarEntrega: async (idEntrega: number): Promise<Entrega> => {
    const { data } = await api.post<RespostaSucesso<Entrega>>(
      `/entregas/${idEntrega}/finalizar`
    );
    return data.dados;
  },

  cancelarEntrega: async (idEntrega: number): Promise<string> => {
    const { data } = await api.post<RespostaSucesso<{ message: string }>>(
      `/entregas/${idEntrega}/cancelar`
    );
    return data.dados.message;
  },
};
