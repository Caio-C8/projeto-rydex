import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { TipoUsuario } from "../dto/login.dto";

@Injectable()
export class EmpresaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException("Acesso negado.");
    }

    if (usuario.tipo !== TipoUsuario.EMPRESA) {
      throw new ForbiddenException("Acesso negado. Rota protegida.");
    }

    return true;
  }
}
