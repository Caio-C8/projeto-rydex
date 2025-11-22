import axios from "axios";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const empresasService = {
  // 1. Buscar Dados da Empresa
  async buscarDadosEmpresa(id: number) {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/empresas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.dados || response.data;
  },

  // 2. Adicionar Saldo
  async adicionarSaldo(valor: number) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/empresas/adicionar-saldo`, 
      { valor }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // 3. Cadastrar Empresa (Público)
  async cadastrar(dadosCadastro: any) {
    const response = await axios.post(`${API_URL}/empresas`, dadosCadastro);
    return response.data;
  },

  // 4. Redefinir Senha (Público)
  async redefinirSenha(dados: { email: string; nova_senha: string; confirmar_senha: string }) {
    // Nota: Verifique se a rota no backend é /auth/recuperar-senha ou /empresas/recuperacao-senha
    // Baseado nas nossas últimas conversas, criamos no AuthController:
    const response = await axios.post(`${API_URL}/auth/recuperar-senha`, dados);
    return response.data;
  },

  // 5. Criar Solicitação
  async criarSolicitacao(dadosSolicitacao: any) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/solicitacoes`, 
      dadosSolicitacao, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // 6. Listar Solicitações (Histórico)
  async listarSolicitacoes() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/solicitacoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.dados || response.data || [];
  },

  // 👇 7. NOVA FUNÇÃO: Simular Solicitação (Faltava esta!)
  async simularSolicitacao(dadosSolicitacao: any) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/solicitacoes/simular`, 
      dadosSolicitacao, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Retorna o objeto com valor_estimado, distancia, etc.
    return response.data; 
  }
};