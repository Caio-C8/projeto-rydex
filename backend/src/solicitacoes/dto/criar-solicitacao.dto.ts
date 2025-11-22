import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CriarSolicitacaoDto {
  @ApiProperty({
    description: "CEP de destino da entrega.",
    example: "38700000",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  cep: string;

  @ApiProperty({ description: "Cidade de destino.", example: "Patos de Minas" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  cidade: string;

  @ApiProperty({ description: "Número do local de destino.", example: 1050 })
  @IsNumber()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  numero: number;

  @ApiProperty({ description: "Bairro de destino.", example: "Centro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  bairro: string;

  @ApiProperty({
    description: "Logradouro (Rua/Avenida) de destino.",
    example: "Rua Major Gote",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  logradouro: string;

  @ApiProperty({
    description: "Complemento de destino (ex: Apto 101).",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  complemento?: string;

  @ApiProperty({
    description: "Ponto de referência de destino.",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  ponto_referencia?: string;

  @ApiProperty({
    description: "Indica se há um item a ser retornado ao ponto de coleta.",
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  item_retorno?: boolean = false;

  @ApiProperty({
    description: "Descrição do item a ser retornado, se houver.",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descricao_item_retorno?: string;

  @ApiProperty({
    description: "Observações adicionais para o entregador.",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacao?: string;
}