import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
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
    const { email, senha, tipo } = loginDto;

    let usuario: any;

    if (tipo === TipoUsuario.EMPRESA) {
      usuario = await this.prisma.empresa.findUnique({ where: { email } });
    } else {    
      usuario = await this.prisma.entregador.findUnique({ 
        where: { email },
        select: { 
          id: true, 
          email: true, 
          senha: true,
          latitude: true, 
          longitude: true, 
          ultima_atualizacao_localizacao: true 
        }
      });
    }

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload: UsuarioPayload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: tipo,
    };
    
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: tipo,
        latitude: usuario.latitude ?? null, 
        longitude: usuario.longitude ?? null,
        ultimaAtualizacaoLocalizacao: usuario.ultima_atualizacao_localizacao ?? null
      },
    };
  }
}