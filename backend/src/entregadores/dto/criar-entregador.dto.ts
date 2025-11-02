import { IsDateString, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
    description: "CPF do entregador (apenas números)",
    example: "12345678900",
  })
  @IsString({ message: "CPF inválido." })
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
    description: "Senha de acesso",
    example: "senhaForte123",
  })
  @IsString({ message: "Senha inválida." })
  @IsNotEmpty({ message: "Preencha o campo 'Senha'." })
  senha: string;

  @ApiProperty({
    description: "Número de celular com DDD",
    example: "11987654321",
  })
  @IsString({ message: "Celular inválida." })
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
