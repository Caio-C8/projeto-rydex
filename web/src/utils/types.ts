export interface Usuario {
  id: number;
  email: string;
  nome: string | null;
}

export interface RespostaApi<T> {
  mensagem: string;
  sucesso: boolean;
  status: number;
  dados?: T;
  erros?: string[];
}
