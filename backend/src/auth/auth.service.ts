import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcrypt";

import { PrismaService } from "../prisma.service";

import { LoginDto, TipoUsuario } from "./dto/login.dto";
import { RespostaLoginDto } from "./dto/resposta-login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<RespostaLoginDto> {
    const { email, senha, tipo } = loginDto;

    let usuario: any = null;

    if (tipo === TipoUsuario.EMPRESA) {
      usuario = await this.prisma.empresa.findUnique({
        where: { email },
      });
    } else if (tipo === TipoUsuario.ENTREGADOR) {
      usuario = await this.prisma.entregador.findUnique({
        where: { email },
      });
    }

    if (!usuario) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: tipo,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: tipo,
      },
    };
  }
}
