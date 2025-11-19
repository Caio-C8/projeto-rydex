import { ApiProperty } from "@nestjs/swagger";
import { TipoUsuario } from "./login.dto";

class UsuarioLoginRespostaDto {
  @ApiProperty({
    description: "ID do usuário (seja Empresa ou Entregador)",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "E-mail do usuário",
    example: "usuario@email.com",
  })
  email: string;

  @ApiProperty({
    description: "Tipo do usuário",
    enum: TipoUsuario,
    example: TipoUsuario.EMPRESA,
  })
  tipo: TipoUsuario;

  @ApiProperty({ required: false })
  latitude: number | null;

  @ApiProperty({ required: false })
  longitude: number | null;

  @ApiProperty({ required: false })
  ultimaAtualizacaoLocalizacao: Date | null;
}

export class RespostaLoginDto {
  @ApiProperty({
    description: "Token de acesso JWT (JSON Web Token)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    description: "Informações básicas do usuário autenticado",
    type: UsuarioLoginRespostaDto,
  })
  usuario: UsuarioLoginRespostaDto;
}
