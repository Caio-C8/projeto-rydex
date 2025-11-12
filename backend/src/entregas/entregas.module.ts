import { Module } from "@nestjs/common";
import { EntregasGateway } from "./entregas.gateway";
import { AuthModule } from "src/auth/auth.module";
import { EntregasService } from "./entregas.service";
import { EntregasController } from "./entregas.controller";

@Module({
  imports: [AuthModule],
  controllers: [EntregasController],
  providers: [EntregasGateway, EntregasService],
})
export class EntregasModule {}
