import { StatusEntregadores } from "@prisma/client";
import { RespostaArquivosDto } from "./resposta-arquivos.dto";

export class RespostaEntregadorDto {
  id: number;
  nome: string;
  data_nascimento: Date;
  cpf: string;
  email: string;
  saldo: number;
  celular: string;
  status: StatusEntregadores;
  placa_veiculo: string;
  latitude: number | null;
  longitude: number | null;
  ultima_atualizacao_localizacao: Date | null;
  chave_pix: string;
  arquivos: RespostaArquivosDto[];
}
