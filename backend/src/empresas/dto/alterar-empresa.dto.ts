import {
  IsString,
  IsEmail,
  MaxLength,
  IsNumber,
  IsInt,
  IsOptional,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class AlterarEmpresaDto {
  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "O nome da empresa deve ser um texto." })
  @MaxLength(255, {
    message: "O nome da empresa deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  nome_empresa?: string;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsEmail({}, { message: "O email fornecido não é válido." })
  @MaxLength(255, { message: "O email deve ter no máximo 255 caracteres." })
  @IsOptional()
  email?: string;

  @IsString({ message: "A senha deve ser um texto." })
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  @IsOptional()
  senha?: string;

  // Novo campo para confirmação de senha
  @IsString({ message: "A confirmação de senha deve ser um texto." })
  @MinLength(6, {
    message: "A confirmação de senha deve ter no mínimo 6 caracteres.",
  })
  @IsOptional()
  confirmar_senha?: string;

  @Transform(({ value }) => value.replace(/\D/g, "")) // Remove tudo que não é dígito
  @IsString({ message: "O CEP deve ser um texto." })
  @MaxLength(10, { message: "O CEP deve ter no máximo 10 caracteres." })
  @IsOptional()
  cep?: string;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "A cidade deve ser um texto." })
  @MaxLength(255, { message: "A cidade deve ter no máximo 255 caracteres." })
  @IsOptional()
  cidade?: string;

  @IsNumber({}, { message: "O número deve ser um valor numérico." })
  @IsInt({ message: "O número deve ser um inteiro." })
  @IsOptional()
  numero?: number;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "O bairro deve ser um texto." })
  @MaxLength(255, { message: "O bairro deve ter no máximo 255 caracteres." })
  @IsOptional()
  bairro?: string;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "O logradouro deve ser um texto." })
  @MaxLength(255, {
    message: "O logradouro deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  logradouro?: string;

  @Transform(({ value }) => (value ? value.toLowerCase() : value)) // Transforma para minúsculas se existir
  @IsString({ message: "O complemento deve ser um texto." })
  @MaxLength(255, {
    message: "O complemento deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  complemento?: string;

  @Transform(({ value }) => (value ? value.toLowerCase() : value)) // Transforma para minúsculas se existir
  @IsString({ message: "O ponto de referência deve ser um texto." })
  @MaxLength(255, {
    message: "O ponto de referência deve ter no máximo 255 caracteres.",
  })
  @IsOptional()
  ponto_referencia?: string;
}
