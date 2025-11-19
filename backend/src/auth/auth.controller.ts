import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RespostaLoginDto } from "./dto/resposta-login.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Realiza o login de Empresas ou Entregadores" })
  @ApiResponse({
    status: 200,
    description: "Login realizado com sucesso. Retorna o token de acesso.",
    type: RespostaLoginDto,
  })
  @ApiResponse({
    status: 401,
    description: "E-mail ou senha inválidos.",
  })
  async login(@Body() loginDto: LoginDto): Promise<RespostaLoginDto> {
    return this.authService.login(loginDto);
  }
}
