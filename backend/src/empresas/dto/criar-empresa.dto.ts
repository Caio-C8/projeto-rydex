export class CriarEmpresaDto {
  nome_empresa: string;
  cnpj: string;
  email: string;
  senha: string;
  cep: string;
  cidade: string;
  numero: number;
  bairro: string;
  logradouro: string;
  complemento?: string;
  ponto_referencia?: string;
}
