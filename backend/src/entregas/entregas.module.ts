import { Module } from "@nestjs/common";
import { EntregasGateway } from "./entregas.gateway";
import { AuthModule } from "src/auth/auth.module";
import { EntregasService } from "./entregas.service";
import { EntregasController } from "./entregas.controller";
import { PrismaModule } from "src/prisma.module";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [EntregasController],
  providers: [EntregasGateway, EntregasService],
})
export class EntregasModule {}
