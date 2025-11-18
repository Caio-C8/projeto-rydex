// backend/src/entregadores/dto/atualizar-localizacao.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO para receber as coordenadas geográficas atualizadas
 * do entregador via aplicativo mobile.
 */
export class AtualizarLocalizacaoDto {
  @ApiProperty({
    description: 'Latitude atual do entregador.',
    example: -23.55052,
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty({ message: 'A latitude é obrigatória.' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 6 },
    { message: 'A latitude deve ser um número válido.' },
  )
  @Min(-90, { message: 'A latitude deve ser maior ou igual a -90.' })
  @Max(90, { message: 'A latitude deve ser menor ou igual a 90.' })
  latitude: number;

  @ApiProperty({
    description: 'Longitude atual do entregador.',
    example: -46.633308,
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty({ message: 'A longitude é obrigatória.' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 6 },
    { message: 'A longitude deve ser um número válido.' },
  )
  @Min(-180, { message: 'A longitude deve ser maior ou igual a -180.' })
  @Max(180, { message: 'A longitude deve ser menor ou igual a 180.' })
  longitude: number;
}