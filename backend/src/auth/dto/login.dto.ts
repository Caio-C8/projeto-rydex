import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum TipoUsuario {
  EMPRESA = "empresa",
  ENTREGADOR = "entregador",
}

export class LoginDto {
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
    description: "Tipo de usuário que será autenticado (entregador ou empresa)",
    example: "entregador",
  })
  @IsEnum(TipoUsuario, {
    message: "O tipo de usuário deve ser 'empresa' ou 'entregador'.",
  })
  @IsNotEmpty({ message: "O tipo de usuário é obrigatório." })
  tipo: TipoUsuario;
}
