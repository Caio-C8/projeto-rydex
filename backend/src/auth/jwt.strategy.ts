//
// ──────────────────────────────────────────────────────────
//   Arquivo: backend/src/auth/jwt.strategy.ts (CORRIGIDO)
// ──────────────────────────────────────────────────────────
//
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Este é o "Crachá" (Payload)!
 * Define o que vamos guardar DENTRO do token.
 */
export interface UsuarioPayload {
  sub: number; // O ID do usuário (empresa ou entregador)
  email: string;
  tipo: 'empresa' | 'entregador'; // Para sabermos quem é
  iat?: number; // Issued at (data de criação)
  exp?: number; // Expires at (data de expiração)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // --- ESTA É A CORREÇÃO ---
    const secret = process.env.JWT_SECRET;

    // 1. Verificamos se o segredo existe ANTES de usar.
    // Se não existir, a aplicação irá falhar na inicialização (o que é bom!).
    if (!secret) {
      throw new Error(
        'JWT_SECRET não está definido no arquivo .env. A aplicação não pode iniciar.',
      );
    }
    // --- FIM DA CORREÇÃO ---

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. Agora o TypeScript sabe que 'secret' é uma string e não 'undefined'.
      secretOrKey: secret,
    });
  }

  /**
   * Este método é chamado pelo NestJS DEPOIS que ele
   * valida o token com o segredo.
   *
   * Ele "desempacota" o token e nos devolve o "Crachá" (payload).
   */
  async validate(payload: UsuarioPayload): Promise<UsuarioPayload> {
    // Opcional, mas é uma boa prática verificar o payload
    if (payload.tipo !== 'empresa' && payload.tipo !== 'entregador') {
      throw new UnauthorizedException('Tipo de usuário inválido no token.');
    }
    
    // O token JÁ É a prova da autenticação.
    // Só precisamos retornar os dados para o @Usuario() usar.
    return {
      sub: payload.sub,
      email: payload.email,
      tipo: payload.tipo,
    };
  }
}