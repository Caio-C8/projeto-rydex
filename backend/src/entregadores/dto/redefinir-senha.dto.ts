import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from "class-validator";

export class RedefinirSenhaDto {
  @ApiProperty({
    description: "E-mail do entregador cadastrado",
    example: "joao.silva@email.com",
  })
  @IsEmail({}, { message: "O e-mail informado é inválido." })
  @IsNotEmpty({ message: "O e-mail é obrigatório." })
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
  nova_senha: string;

  @ApiProperty({
    description:
      "Confirmação da senha de acesso (mínimo 8 caracteres, 1 número e 1 caractere especial)",
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
}
