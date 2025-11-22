import axios from "axios";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const empresasService = {
  async buscarDadosEmpresa(id: number) {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/empresas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.dados || response.data;
  },

  async adicionarSaldo(valor: number) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/empresas/adicionar-saldo`, 
      { valor }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async cadastrar(dadosCadastro: any) {
    const response = await axios.post(`${API_URL}/empresas`, dadosCadastro);
    return response.data;
  },

  async redefinirSenha(dados: { email: string; nova_senha: string; confirmar_senha: string }) {
    const response = await axios.patch(`${API_URL}/empresas/recuperacao-senha`, dados);
    return response.data;
  },

  async criarSolicitacao(dadosSolicitacao: any) {
    const token = authService.getToken();
    
    const response = await axios.post(
      `${API_URL}/solicitacoes`, 
      dadosSolicitacao, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data;
  }
};