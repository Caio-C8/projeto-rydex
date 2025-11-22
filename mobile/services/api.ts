import axios from 'axios';

// Substitua pelo SEU IP que você pegou no passo 1
// Substitua a porta (ex: 3333, 3000, 8080) pela porta do seu Backend
const api = axios.create({
  baseURL: 'http://192.168.100.8:3000"', 
});

export default api;