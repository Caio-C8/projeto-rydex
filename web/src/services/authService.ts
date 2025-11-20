import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  async login(email: string, senha: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      senha,
      tipo: 'empresa' 
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  getToken() {
    return localStorage.getItem('token');
  }
};