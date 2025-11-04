import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  MinLength,
  Matches,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsCpf } from "../../validators/is-cpf.validator";
import { IsCelular } from "src/validators/is-celular.validator";

const removerNaoDigitos = (value: string) => value.replace(/[^\d]/g, "");
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
  @ValidateIf((o, value) => value !== null && value !== "")
  @IsDateString({}, { message: "Data de nascimento inválida." })
  dataNascimento?: string;

  @ApiProperty({
    description: "Email único para login",
    example: "joao.silva@email.com",
    required: false,
  })
  @IsOptional()
  @ValidateIf((o, value) => value !== null && value !== "")
  @IsEmail({}, { message: "E-mail inválido." })
  email?: string;

  @ApiProperty({
    description:
      "Senha de acesso (mínimo 8 caracteres, 1 número e 1 caractere especial)",
    example: "senha!Forte123",
    required: false,
  })
  @IsOptional()
  @ValidateIf((o, value) => value !== null && value !== "")
  @IsString({ message: "Senha inválida." })
  @MinLength(8, { message: "Senha deve ter 8 ou mais caracteres." })
  @Matches(/.*\d/, { message: "Senha deve conter pelo menos um número." })
  @Matches(/.*[!@#$%^&*(),.?":{}|<>]/, {
    message: "Senha deve conter pelo menos um caractere especial.",
  })
  senha?: string;

  @ApiProperty({
    description: "Número de celular com DDD (com ou sem formatação)",
    example: "(11) 98765-4321",
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => removerNaoDigitos(value))
  @ValidateIf((o, value) => value !== null && value !== "")
  @IsString({ message: "Celular inválido." })
  @IsCelular()
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
