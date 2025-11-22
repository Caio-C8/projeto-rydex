// ==========================================
// INPUTS - DADOS ENVIADOS PELO MOBILE
// ==========================================

// Enum espelhado do backend
export type TipoUsuario = "empresa" | "entregador";

export interface LoginDto {
  email: string;
  senha: string;
  tipo: TipoUsuario;
}

export interface CriarEntregadorDto {
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  cpf: string;
  email: string;
  senha: string;
  confirmar_senha: string;
  celular: string;
  placaVeiculo: string;
  chavePix: string;
  latitude?: number; // Opcional no backend, mas bom enviar se tiver
  longitude?: number; // Opcional no backend, mas bom enviar se tiver
}

export interface AlterarEntregadorDto {
  nome?: string;
  dataNascimento?: string; // YYYY-MM-DD
  email?: string;
  senha?: string;
  celular?: string;
  placaVeiculo?: string;
  chavePix?: string;
}

export interface RedefinirSenhaDto {
  email: string;
  nova_senha: string;
  confirmar_senha: string;
}

export interface TransacaoSaldoDto {
  valor: number; // Em centavos (Inteiro)
}

export interface AtualizarLocalizacaoDto {
  latitude: number;
  longitude: number;
}

// ==========================================
// AUXILIARES (Específico do React Native)
// ==========================================
// Usado para tipar o arquivo antes de colocar no FormData
export interface ImageFile {
  uri: string;
  name: string;
  type: string; // ex: 'image/jpeg'
}
