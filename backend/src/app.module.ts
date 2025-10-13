import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EntregadoresModule } from "./entregadores/entregadores.module";

@Module({
  imports: [EntregadoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
