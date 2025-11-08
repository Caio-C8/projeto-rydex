import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EntregadoresModule } from "./entregadores/entregadores.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { EmpresasModule } from "./empresas/empresas.module";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),

      serveRoot: "/public",
    }),
    EntregadoresModule,
    EmpresasModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
