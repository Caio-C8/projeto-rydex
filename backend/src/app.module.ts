import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EntregadoresModule } from "./entregadores/entregadores.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),

      serveRoot: "/public",
    }),
    EntregadoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
