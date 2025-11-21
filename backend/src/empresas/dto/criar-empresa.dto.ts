import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  IsNumber,
  IsInt,
  IsOptional,
  MinLength,
  Matches,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsCnpj } from "src/validators/is-cnpj.validator";

const removerNaoDigitos = (value: string) => value.replace(/[^\d]/g, "");

export class CriarEmpresaDto {
  @IsString({ message: "O nome da empresa deve ser um texto." })
  @IsNotEmpty({ message: "O nome da empresa é obrigatório." })
  @MaxLength(255, {
    message: "O nome da empresa deve ter no máximo 255 caracteres.",
  })
  nome_empresa: string;

  @Transform(({ value }) => removerNaoDigitos(value))
  @IsString({ message: "O CNPJ deve ser um texto." })
  @IsNotEmpty({ message: "O CNPJ é obrigatório." })
  @IsCnpj()
  @MaxLength(18, { message: "O CNPJ deve ter no máximo 18 caracteres." })
  cnpj: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsEmail({}, { message: "O email fornecido não é válido." })
  @IsNotEmpty({ message: "O email é obrigatório." })
  @MaxLength(255, { message: "O email deve ter no máximo 255 caracteres." })
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
  confirmar_senha: string;

  @Transform(({ value }) => value.replace(/\D/g, ""))
  @IsString({ message: "O CEP deve ser um texto." })
  @IsNotEmpty({ message: "O CEP é obrigatório." })
  @MaxLength(10, { message: "O CEP deve ter no máximo 10 caracteres." })
  cep: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: "A cidade deve ser um texto." })
  @IsNotEmpty({ message: "A cidade é obrigatória." })
  @MaxLength(255, { message: "A cidade deve ter no máximo 255 caracteres." })
  cidade: string;

  @IsNumber({}, { message: "O número deve ser um valor numérico." })
  @IsInt({ message: "O número deve ser um inteiro." })
  @IsNotEmpty({ message: "O número é obrigatório." })
  numero: number;

  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: "O bairro deve ser um texto." })
  @IsNotEmpty({ message: "O bairro é obrigatório." })
  @MaxLength(255, { message: "O bairro deve ter no máximo 255 caracteres." })
  bairro: string;

  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: "O logradouro deve ser um texto." })
  @IsNotEmpty({ message: "O logradouro é obrigatório." })
  @MaxLength(255, {
    message: "O logradouro deve ter no máximo 255 caracteres.",
  })
  logradouro: string;

  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsString({ message: "O complemento deve ser um texto." })
  @MaxLength(255, {
    message: "O complemento deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  complemento?: string;

  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsString({ message: "O ponto de referência deve ser um texto." })
  @MaxLength(255, {
    message: "O ponto de referência deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  ponto_referencia?: string;
}
