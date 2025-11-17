import { StatusEntregadores } from "@prisma/client";
import { RespostaArquivosDto } from "./resposta-arquivos.dto";
import { ApiProperty } from "@nestjs/swagger";

export class RespostaEntregadorDto {
  @ApiProperty({ description: "ID único do entregador", example: 1 })
  id: number;

  @ApiProperty({ description: "Nome completo do entregador" })
  nome: string;

  @ApiProperty({ description: "Data de nascimento" })
  data_nascimento: Date;

  @ApiProperty({ description: "CPF do entregador (formatado ou não)" })
  cpf: string;

  @ApiProperty({ description: "Email de login do entregador" })
  email: string;

  @ApiProperty({ description: "Saldo atual na carteira do entregador" })
  saldo: number;

  @ApiProperty({ description: "Número de celular (com DDD)" })
  celular: string;

  @ApiProperty({
    description: "Status atual do entregador (ATIVO, INATIVO, BLOQUEADO)",
    enum: StatusEntregadores,
  })
  status: StatusEntregadores;

  @ApiProperty({ description: "Placa do veículo (ex: ABC1234)" })
  placa_veiculo: string;

  @ApiProperty({
    description: "Última latitude conhecida",
    nullable: true,
  })
  latitude: number | null;

  @ApiProperty({
    description: "Última longitude conhecida",
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: "Data da última atualização de localização",
    nullable: true,
  })
  ultima_atualizacao_localizacao: Date | null;

  @ApiProperty({ description: "Chave PIX para pagamentos" })
  chave_pix: string;

  @ApiProperty({
    description: "Lista de arquivos/documentos do entregador",
    type: [RespostaArquivosDto],
  })
  arquivos: RespostaArquivosDto[];
}
