//
// ──────────────────────────────────────────────────────────
//   Arquivo: backend/src/auth/auth.service.ts (CORRIGIDO)
// ──────────────────────────────────────────────────────────
//
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
// 1. Importamos o Enum 'TipoUsuario' junto com o DTO
import { LoginDto, TipoUsuario } from './dto/login.dto';
import { RespostaLoginDto } from './dto/resposta-login.dto';
import * as bcrypt from 'bcrypt';
import { UsuarioPayload } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<RespostaLoginDto> {
    // 'tipo' aqui é o ENUM (Ex: TipoUsuario.EMPRESA)
    const { email, senha, tipo } = loginDto;

    let usuario: any;

    // 2. Comparamos o ENUM com o ENUM
    if (tipo === TipoUsuario.EMPRESA) {
      usuario = await this.prisma.empresa.findUnique({ where: { email } });
    } else {
      // (tipo === TipoUsuario.ENTREGADOR)
      usuario = await this.prisma.entregador.findUnique({ where: { email } });
    }

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

const senhaCorreta = await bcrypt.compare(senha, usuario.senha); // ✅ CORRETO
  

    if (!senhaCorreta) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // 3. O "Crachá" (Payload do JWT) espera a string.
    // O valor do enum (tipo) JÁ é a string correta ('empresa' ou 'entregador').
    const payload: UsuarioPayload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: tipo, // O valor do enum é a string que queremos
    };

    const token = this.jwtService.sign(payload);

    // 4. A "Resposta" (DTO) espera o ENUM.
    // O 'tipo' que recebemos do loginDto JÁ é o enum.
    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: tipo, // Passamos o Enum original
      },
    };
  }
}