import { IsString, IsEmail, IsDateString, IsOptional } from "class-validator";

export class AlterarEntregadorDto {
  @IsOptional()
  @IsString({ message: "Nome inválido." })
  nome?: string;

  @IsOptional()
  @IsDateString({}, { message: "Data de nascimento inválida." })
  dataNascimento?: string;

  @IsOptional()
  @IsString({ message: "CPF inválido." })
  cpf?: string;

  @IsOptional()
  @IsEmail({}, { message: "E-mail inválido." })
  email?: string;

  @IsOptional()
  @IsString({ message: "Senha inválida." })
  senha?: string;

  @IsOptional()
  @IsString({ message: "Celular inválida." })
  celular?: string;

  @IsOptional()
  @IsString({ message: "Placa do veículo inválida." })
  placaVeiculo?: string;

  @IsOptional()
  @IsString({ message: "Chave pix inválida." })
  chavePix?: string;
}
