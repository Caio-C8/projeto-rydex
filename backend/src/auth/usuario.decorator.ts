import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UsuarioPayload } from "./jwt.strategy";

export const Usuario = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UsuarioPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
