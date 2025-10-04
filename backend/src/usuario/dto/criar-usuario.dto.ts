import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CriarUsuarioDto {
  @IsEmail({}, { message: "O e-mail fornecido é inválido." })
  @IsNotEmpty({ message: "O e-mail não pode estar vazio." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "O nome não pode estar vazio." })
  nome: string;
}