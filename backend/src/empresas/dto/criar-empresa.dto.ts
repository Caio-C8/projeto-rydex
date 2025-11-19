import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  IsNumber,
  IsInt,
  IsOptional,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { compileFunction } from "vm";

export class CriarEmpresaDto {
  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "O nome da empresa deve ser um texto." })
  @IsNotEmpty({ message: "O nome da empresa é obrigatório." })
  @MaxLength(255, {
    message: "O nome da empresa deve ter no máximo 255 caracteres.",
  })
  nome_empresa: string;

  @Transform(({ value }) => value.replace(/\D/g, "")) // Remove tudo que não é dígito
  @IsString({ message: "O CNPJ deve ser um texto." })
  @IsNotEmpty({ message: "O CNPJ é obrigatório." })
  @MaxLength(18, { message: "O CNPJ deve ter no máximo 18 caracteres." }) // A validação de tamanho ainda se aplica ao DTO que chega
  cnpj: string;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsEmail({}, { message: "O email fornecido não é válido." })
  @IsNotEmpty({ message: "O email é obrigatório." })
  @MaxLength(255, { message: "O email deve ter no máximo 255 caracteres." })
  email: string;

  @IsString({ message: "A senha deve ser um texto." })
  @IsNotEmpty({ message: "A senha é obrigatória." })
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  senha: string;

  // Novo campo para confirmação de senha
  @IsString({ message: "A confirmação de senha deve ser um texto." })
  @IsNotEmpty({ message: "A confirmação de senha é obrigatória." })
  @MinLength(6, {
    message: "A confirmação de senha deve ter no mínimo 6 caracteres.",
  })
  confirmar_senha: string;

  @Transform(({ value }) => value.replace(/\D/g, "")) // Remove tudo que não é dígito
  @IsString({ message: "O CEP deve ser um texto." })
  @IsNotEmpty({ message: "O CEP é obrigatório." })
  @MaxLength(10, { message: "O CEP deve ter no máximo 10 caracteres." })
  cep: string;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "A cidade deve ser um texto." })
  @IsNotEmpty({ message: "A cidade é obrigatória." })
  @MaxLength(255, { message: "A cidade deve ter no máximo 255 caracteres." })
  cidade: string;

  @IsNumber({}, { message: "O número deve ser um valor numérico." })
  @IsInt({ message: "O número deve ser um inteiro." })
  @IsNotEmpty({ message: "O número é obrigatório." })
  numero: number;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "O bairro deve ser um texto." })
  @IsNotEmpty({ message: "O bairro é obrigatório." })
  @MaxLength(255, { message: "O bairro deve ter no máximo 255 caracteres." })
  bairro: string;

  @Transform(({ value }) => value.toLowerCase()) // Transforma para minúsculas
  @IsString({ message: "O logradouro deve ser um texto." })
  @IsNotEmpty({ message: "O logradouro é obrigatório." })
  @MaxLength(255, {
    message: "O logradouro deve ter no máximo 255 caracteres.",
  })
  logradouro: string;

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
