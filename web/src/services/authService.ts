import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  async login(email: string, senha: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      senha,
      tipo: 'empresa'
    });

    // Tenta encontrar o token em vários lugares possíveis
    const token = response.data.dados?.access_token || response.data.access_token;

    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.error("Token não encontrado na resposta:", response.data);
    }
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  getToken() {
    return localStorage.getItem('token');
  },

  // Atenção: O nome da função é getEmpresaId (com I de Igreja maiúsculo)
  getEmpresaId(): number | null {
    const token = localStorage.getItem('token'); // Lemos diretamente para evitar erros com 'this'
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      // Retorna o ID se existir (convertendo para número)
      return payload.sub ? Number(payload.sub) : null;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }
};