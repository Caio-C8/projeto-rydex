import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EntregadoresModule } from "./entregadores/entregadores.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EmpresasModule } from "./empresas/empresas.module";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma.module";
import { SolicitacoesModule } from "./solicitacoes/solicitacoes.module";
import { ConfigModule } from "@nestjs/config";
import { EntregasModule } from "./entregas/entregas.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/public",
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    SolicitacoesModule,
    PrismaModule,
    EntregadoresModule,
    EmpresasModule,
    AuthModule,
    EntregasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
