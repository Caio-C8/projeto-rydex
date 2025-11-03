import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsCpf } from "../../validators/is-cpf.validator";
import { IsCelular } from "src/validators/is-celular.validator";

const removerNaoDigitos = (value: string) => value.replace(/[^\d]/g, "");

export class CriarEntregadorDto {
  @ApiProperty({
    description: "Nome completo do entregador",
    example: "João da Silva",
  })
  @IsString({ message: "Nome inválido." })
  @IsNotEmpty({ message: "Preencha o campo 'Nome'." })
  nome: string;

  @ApiProperty({
    description: "Data de nascimento no formato YYYY-MM-DD",
    example: "1995-10-20",
  })
  @IsDateString({}, { message: "Data de nascimento inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Data de Nascimnto'." })
  dataNascimento: string;

  @ApiProperty({
    description: "CPF do entregador (com ou sem formatação)",
    example: "123.456.789-00",
  })
  @Transform(({ value }) => removerNaoDigitos(value))
  @IsString({ message: "CPF inválido." })
  @IsCpf()
  @IsNotEmpty({ message: "Preencha o campo 'CPF'." })
  cpf: string;

  @ApiProperty({
    description: "Email único para login",
    example: "joao.silva@email.com",
  })
  @IsEmail({}, { message: "E-mail inválido." })
  @IsNotEmpty({ message: "Preencha o campo 'E-mail'." })
  email: string;

  @ApiProperty({
    description:
      "Senha de acesso (mínimo 8 caracteres, 1 número e 1 caractere especial)",
    example: "senha!Forte123",
  })
  @IsString({ message: "Senha inválida." })
  @MinLength(8, { message: "Senha deve ter 8 ou mais caracteres." })
  @Matches(/.*\d/, { message: "Senha deve conter pelo menos um número." })
  @Matches(/.*[!@#$%^&*(),.?":{}|<>]/, {
    message: "Senha deve conter pelo menos um caractere especial.",
  })
  @IsNotEmpty({ message: "Preencha o campo 'Senha'." })
  senha: string;

  @ApiProperty({
    description: "Número de celular com DDD (com ou sem formatação)",
    example: "(11) 98765-4321",
  })
  @Transform(({ value }) => removerNaoDigitos(value))
  @IsString({ message: "Celular inválido." })
  @IsCelular()
  @IsNotEmpty({ message: "Preencha o campo 'Celular'." })
  celular: string;

  @ApiProperty({
    description: "Placa do veículo (moto ou carro)",
    example: "ABC1B34",
  })
  @IsString({ message: "Placa do veículo inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Placa do veículo'." })
  placaVeiculo: string;

  @ApiProperty({
    description: "Chave PIX para recebimento (CPF, Email, Celular, etc.)",
  })
  @IsString({ message: "Chave pix inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Chave pix'." })
  chavePix: string;
}
