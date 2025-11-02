import { IsString, IsEmail, IsDateString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AlterarEntregadorDto {
  @ApiProperty({
    description: "Nome completo do entregador",
    example: "João da Silva",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Nome inválido." })
  nome?: string;

  @ApiProperty({
    description: "Data de nascimento no formato YYYY-MM-DD",
    example: "1995-10-20",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Data de nascimento inválida." })
  dataNascimento?: string;

  @ApiProperty({
    description: "CPF do entregador (apenas números)",
    example: "12345678900",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "CPF inválido." })
  cpf?: string;

  @ApiProperty({
    description: "Email único para login",
    example: "joao.silva@email.com",
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: "E-mail inválido." })
  email?: string;

  @ApiProperty({
    description: "Nova senha de acesso",
    example: "novaSenhaForte456",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Senha inválida." })
  senha?: string;

  @ApiProperty({
    description: "Número de celular com DDD",
    example: "11987654321",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Celular inválida." })
  celular?: string;

  @ApiProperty({
    description: "Placa do veículo (moto ou carro)",
    example: "ABC1B34",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Placa do veículo inválida." })
  placaVeiculo?: string;

  @ApiProperty({
    description: "Chave PIX para recebimento (CPF, Email, Celular, etc.)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Chave pix inválida." })
  chavePix?: string;
}
