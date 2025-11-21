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
  @ApiProperty({
    description: "Razão social ou nome fantasia da empresa",
    example: "Rydex Logística Ltda",
    maxLength: 255,
  })
  @IsString({ message: "O nome da empresa deve ser um texto." })
  @IsNotEmpty({ message: "O nome da empresa é obrigatório." })
  @MaxLength(255, {
    message: "O nome da empresa deve ter no máximo 255 caracteres.",
  })
  nome_empresa: string;

  @ApiProperty({
    description: "CNPJ da empresa (apenas números ou com formatação)",
    example: "12.345.678/0001-90",
    maxLength: 18,
  })
  @Transform(({ value }) => removerNaoDigitos(value))
  @IsString({ message: "O CNPJ deve ser um texto." })
  @IsNotEmpty({ message: "O CNPJ é obrigatório." })
  @IsCnpj()
  @MaxLength(18, { message: "O CNPJ deve ter no máximo 18 caracteres." })
  cnpj: string;

  @ApiProperty({
    description: "E-mail corporativo para login e contato",
    example: "contato@rydex.com.br",
    maxLength: 255,
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail({}, { message: "O email fornecido não é válido." })
  @IsNotEmpty({ message: "O email é obrigatório." })
  @MaxLength(255, { message: "O email deve ter no máximo 255 caracteres." })
  email: string;

  @ApiProperty({
    description:
      "Senha de acesso (mínimo 8 caracteres, 1 número e 1 caractere especial)",
    example: "Senha!Forte123",
    minLength: 8,
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
    description: "Confirmação da senha (deve ser idêntica à senha)",
    example: "Senha!Forte123",
    minLength: 8,
  })
  @IsString({ message: "Senha inválida." })
  @MinLength(8, { message: "Senha deve ter 8 ou mais caracteres." })
  @Matches(/.*\d/, { message: "Senha deve conter pelo menos um número." })
  @Matches(/.*[!@#$%^&*(),.?":{}|<>]/, {
    message: "Senha deve conter pelo menos um caractere especial.",
  })
  @IsNotEmpty({ message: "Preencha o campo 'Senha'." })
  confirmar_senha: string;

  @ApiProperty({
    description: "CEP do endereço da empresa",
    example: "01001-000",
    maxLength: 10,
  })
  @Transform(({ value }) => value.replace(/\D/g, ""))
  @IsString({ message: "O CEP deve ser um texto." })
  @IsNotEmpty({ message: "O CEP é obrigatório." })
  @MaxLength(10, { message: "O CEP deve ter no máximo 10 caracteres." })
  cep: string;

  @ApiProperty({
    description: "Cidade da empresa",
    example: "São Paulo",
    maxLength: 255,
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: "A cidade deve ser um texto." })
  @IsNotEmpty({ message: "A cidade é obrigatória." })
  @MaxLength(255, { message: "A cidade deve ter no máximo 255 caracteres." })
  cidade: string;

  @ApiProperty({
    description: "Número do endereço",
    example: 1500,
    type: Number,
  })
  @IsNumber({}, { message: "O número deve ser um valor numérico." })
  @IsInt({ message: "O número deve ser um inteiro." })
  @IsNotEmpty({ message: "O número é obrigatório." })
  numero: number;

  @ApiProperty({
    description: "Bairro da empresa",
    example: "Centro",
    maxLength: 255,
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: "O bairro deve ser um texto." })
  @IsNotEmpty({ message: "O bairro é obrigatório." })
  @MaxLength(255, { message: "O bairro deve ter no máximo 255 caracteres." })
  bairro: string;

  @ApiProperty({
    description: "Nome da rua, avenida ou logradouro",
    example: "Avenida Paulista",
    maxLength: 255,
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: "O logradouro deve ser um texto." })
  @IsNotEmpty({ message: "O logradouro é obrigatório." })
  @MaxLength(255, {
    message: "O logradouro deve ter no máximo 255 caracteres.",
  })
  logradouro: string;

  @ApiProperty({
    description: "Complemento do endereço (opcional)",
    example: "Sala 104, Bloco B",
    maxLength: 255,
    required: false,
  })
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsString({ message: "O complemento deve ser um texto." })
  @MaxLength(255, {
    message: "O complemento deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  complemento?: string;

  @ApiProperty({
    description: "Ponto de referência para facilitar a localização (opcional)",
    example: "Ao lado do Banco do Brasil",
    maxLength: 255,
    required: false,
  })
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsString({ message: "O ponto de referência deve ser um texto." })
  @MaxLength(255, {
    message: "O ponto de referência deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  ponto_referencia?: string;
}
