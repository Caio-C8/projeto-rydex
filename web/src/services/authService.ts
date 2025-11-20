import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  async login(email: string, senha: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        senha,
        tipo: 'empresa'
      });

      // 🚨 ALERTA DE DEBUG: Vai mostrar exatamente o que chegou!
      const jsonResposta = JSON.stringify(response.data, null, 2);
      alert("RESPOSTA DO BACKEND:\n" + jsonResposta);

      // Tenta pegar o token no caminho padrão do teu projeto
      // O backend Rydex costuma retornar: { dados: { access_token: "..." } }
      const token = response.data?.dados?.access_token;

      if (token) {
        localStorage.setItem('token', token);
        alert("✅ SUCESSO: Token salvo no localStorage!");
      } else {
        alert("❌ ERRO: Não encontrei 'access_token' dentro de 'dados'. Verifique o JSON acima!");
        console.error("JSON Recebido:", response.data);
      }
      
      return response.data;
    } catch (error) {
      alert("❌ ERRO NA REQUISIÇÃO: Veja o console para detalhes.");
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  getToken() {
    return localStorage.getItem('token');
  }
};