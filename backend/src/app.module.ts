import { Module } from "@nestjs/common";
import { UsuariosModule } from "./usuario/usuarios.module";

@Module({
  imports: [UsuariosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
