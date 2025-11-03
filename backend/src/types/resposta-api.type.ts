export interface RespostaApi<T> {
  mensagem: string;
  sucesso: boolean;
  status: number;
  dados?: T;
  erros?: string[] | object;
}
