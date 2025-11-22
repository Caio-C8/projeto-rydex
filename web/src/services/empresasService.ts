import axios from "axios";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


interface DadosSolicitacao {
  cep: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: number; 
  complemento?: string;
  ponto_referencia?: string;
  item_retorno: boolean;
  descricao_item_retorno?: string;
  observacao?: string;
}

interface DadosRedefinirSenha {
  email: string;
  nova_senha: string;
  confirmar_senha: string;
  cnpj?: string;
}

interface DadosCadastro {
  nome_empresa: string;
  cnpj: string;
  email: string;
  senha: string;
  confirmar_senha: string;
  cep: string;
  cidade: string;
  numero: number;
  bairro: string;
  logradouro: string;
}

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

  async removerSaldo(valor: number) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/empresas/remover-saldo`, 
      { valor }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },


  async redefinirSenha(dados: DadosRedefinirSenha) {
    const response = await axios.patch(
      `${API_URL}/empresas/recuperacao-senha`, 
      dados
    );
    return response.data;
  },

  async cadastrar(dados: DadosCadastro) {
    const response = await axios.post(
      `${API_URL}/empresas`, 
      dados
    );
    return response.data;
  },


  async simularSolicitacao(dadosSolicitacao: DadosSolicitacao) {
    const token = authService.getToken();
    
    const response = await axios.post(
      `${API_URL}/solicitacoes/simular`, 
      dadosSolicitacao, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data; 
  },

  async criarSolicitacao(dadosSolicitacao: DadosSolicitacao) {
    const token = authService.getToken();
    
    const response = await axios.post(
      `${API_URL}/solicitacoes`, 
      dadosSolicitacao, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data;
  }
};