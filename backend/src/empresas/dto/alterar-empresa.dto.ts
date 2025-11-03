import {
  IsString,
  IsEmail,
  MaxLength,
  IsNumber,
  IsInt,
  IsOptional,
  MinLength,
  IsNotEmpty, // 1. Importar o IsNotEmpty
} from 'class-validator';

export class AlterarEmpresaDto {
  @IsString({ message: 'O nome da empresa deve ser um texto.' })
  @MaxLength(255, { message: 'O nome da empresa deve ter no máximo 255 caracteres.' }) //
  @IsNotEmpty({ message: 'O nome da empresa não pode ser vazio.' }) // 2. Adicionar
  @IsOptional()
  nome_empresa?: string;

  // O CNPJ foi removido, o que está correto.

  @IsEmail({}, { message: 'O email fornecido não é válido.' })
  @MaxLength(255, { message: 'O email deve ter no máximo 255 caracteres.' }) //
  @IsNotEmpty({ message: 'O email não pode ser vazio.' }) // 2. Adicionar
  @IsOptional()
  email?: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' }) // 2. Adicionar
  @IsOptional()
  senha?: string;

  @IsString({ message: 'O CEP deve ser um texto.' })
  @MaxLength(10, { message: 'O CEP deve ter no máximo 10 caracteres.' }) //
  @IsNotEmpty({ message: 'O CEP não pode ser vazio.' }) // 2. Adicionar
  @IsOptional()
  cep?: string;

  @IsString({ message: 'A cidade deve ser um texto.' })
  @MaxLength(255, { message: 'A cidade deve ter no máximo 255 caracteres.' }) //
  @IsNotEmpty({ message: 'A cidade não pode ser vazia.' }) // 2. Adicionar
  @IsOptional()
  cidade?: string;

  @IsNumber({}, { message: 'O número deve ser um valor numérico.' })
  @IsInt({ message: 'O número deve ser um inteiro.' }) //
  @IsNotEmpty({ message: 'O número não pode ser vazio.' }) // 2. Adicionar
  @IsOptional()
  numero?: number;

  @IsString({ message: 'O bairro deve ser um texto.' })
  @MaxLength(255, { message: 'O bairro deve ter no máximo 255 caracteres.' }) //
  @IsNotEmpty({ message: 'O bairro não pode ser vazio.' }) // 2. Adicionar
  @IsOptional()
  bairro?: string;

  @IsString({ message: 'O logradouro deve ser um texto.' })
  @MaxLength(255, { message: 'O logradouro deve ter no máximo 255 caracteres.' }) //
  @IsNotEmpty({ message: 'O logradouro não pode ser vazio.' }) // 2. Adicionar
  @IsOptional()
  logradouro?: string;

  // Para estes dois, uma string vazia pode ser intencional
  @IsString({ message: 'O complemento deve ser um texto.' })
  @MaxLength(255, { message: 'O complemento deve ter no máximo 255 caracteres.' }) //
  @IsOptional()
  complemento?: string;

  @IsString({ message: 'O ponto de referência deve ser um texto.' })
  @MaxLength(255, { message: 'O ponto de referência deve ter no máximo 255 caracteres.' }) //
  @IsOptional()
  ponto_referencia?: string;
}