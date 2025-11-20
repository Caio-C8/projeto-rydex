import { ApiProperty } from "@nestjs/swagger";

export class EmpresaResumoDto {
  @ApiProperty({ example: 1, description: "ID da empresa solicitante" })
  id: number;

  @ApiProperty({ example: "Pizzaria Delícia", description: "Nome da empresa" })
  nome_empresa: string;

  @ApiProperty({ example: "38700000", description: "CEP da empresa (Origem)" })
  cep: string;

  @ApiProperty({ example: "Patos de Minas", description: "Cidade da empresa" })
  cidade: string;

  @ApiProperty({ example: "Centro", description: "Bairro da empresa" })
  bairro: string;

  @ApiProperty({
    example: "Rua Major Gote",
    description: "Logradouro da empresa",
  })
  logradouro: string;

  @ApiProperty({ example: 100, description: "Número do endereço da empresa" })
  numero: number;

  @ApiProperty({
    example: -18.5883,
    description: "Latitude da origem (Empresa)",
  })
  latitude: number;

  @ApiProperty({
    example: -46.5172,
    description: "Longitude da origem (Empresa)",
  })
  longitude: number;
}

export class NotificacaoSolicitacao {
  @ApiProperty({ example: 123, description: "ID único da solicitação" })
  id: number;

  @ApiProperty({
    example: 1500,
    description: "Valor que o entregador receberá (em centavos)",
  })
  valor_entregador: number;

  @ApiProperty({
    example: 3800,
    description: "Distância total estimada da rota em metros",
  })
  distancia_m: number;

  @ApiProperty({ example: false, description: "Indica se há item de retorno" })
  item_retorno: boolean;

  @ApiProperty({ required: false, description: "Descrição do item de retorno" })
  descricao_item_retorno?: string;

  @ApiProperty({
    required: false,
    description: "Observações gerais para a entrega",
  })
  observacao?: string;

  @ApiProperty({ example: "38700001", description: "CEP de destino" })
  cep: string;

  @ApiProperty({ example: "Patos de Minas", description: "Cidade de destino" })
  cidade: string;

  @ApiProperty({
    example: "Jardim Panorâmico",
    description: "Bairro de destino",
  })
  bairro: string;

  @ApiProperty({
    example: "Avenida Brasil",
    description: "Logradouro de destino",
  })
  logradouro: string;

  @ApiProperty({ example: 500, description: "Número de destino" })
  numero: number;

  @ApiProperty({
    required: false,
    description: "Complemento do endereço de destino",
  })
  complemento?: string;

  @ApiProperty({
    required: false,
    description: "Ponto de referência do destino",
  })
  ponto_referencia?: string;

  @ApiProperty({ example: -18.5965, description: "Latitude do destino" })
  latitude: number;

  @ApiProperty({ example: -46.5095, description: "Longitude do destino" })
  longitude: number;

  @ApiProperty({ example: "pendente", description: "Status da solicitação" })
  status: string;

  @ApiProperty({
    type: EmpresaResumoDto,
    description: "Dados da empresa solicitante",
  })
  empresa: EmpresaResumoDto;
}
