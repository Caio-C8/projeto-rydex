export interface Usuario {
  id: number;
  email: string;
  nome: string | null;
}

export interface RespostaAPI<T> {
  mensagem: string;
  sucesso: boolean;
  status: number;
  data: T;
}