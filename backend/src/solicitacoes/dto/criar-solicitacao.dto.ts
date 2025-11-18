import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CriarSolicitacaoDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  valor_estimado: number;

  @IsNumber()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  distancia_m: number;

  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsLongitude()
  @Type(() => Number)
  longitude: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  cep: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  cidade: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  numero: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  bairro: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  logradouro: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  complemento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  ponto_referencia?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  item_retorno?: boolean = false;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descricao_item_retorno?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacao?: string;
}