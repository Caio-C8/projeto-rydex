import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TipoUsuario } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";

export interface UsuarioPayload {
  sub: number;
  email: string;
  tipo: TipoUsuario;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>("JWT_SECRET");

    if (!secret) {
      throw new Error(
        "JWT_SECRET não está definido no arquivo .env. A aplicação não pode iniciar."
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: UsuarioPayload): Promise<UsuarioPayload> {
    if (
      payload.tipo !== TipoUsuario.EMPRESA &&
      payload.tipo !== TipoUsuario.ENTREGADOR
    ) {
      throw new UnauthorizedException("Tipo de usuário inválido no token.");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      tipo: payload.tipo,
    };
  }
}
