import { IsDateString, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CriarEntregadorDto {
  @IsString({ message: "Nome inválido." })
  @IsNotEmpty({ message: "Preencha o campo 'Nome'." })
  nome: string;

  @IsDateString({}, { message: "Data de nascimento inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Data de Nascimnto'." })
  dataNascimento: string;

  @IsString({ message: "CPF inválido." })
  @IsNotEmpty({ message: "Preencha o campo 'CPF'." })
  cpf: string;

  @IsEmail({}, { message: "E-mail inválido." })
  @IsNotEmpty({ message: "Preencha o campo 'E-mail'." })
  email: string;

  @IsString({ message: "Senha inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Senha'." })
  senha: string;

  @IsString({ message: "Celular inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Celular'." })
  celular: string;

  @IsString({ message: "Placa do veículo inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Placa do veículo'." })
  placaVeiculo: string;

  @IsString({ message: "Chave pix inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Chave pix'." })
  chavePix: string;
}
