import { Module } from "@nestjs/common";
import { EntregadoresController } from "./entregadores.controller";
import { EntregadoresService } from "./entregadores.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [EntregadoresController],
  providers: [EntregadoresService],
})
export class EntregadoresModule {}
