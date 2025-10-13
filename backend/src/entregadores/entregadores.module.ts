import { Module } from "@nestjs/common";
import { EntregadoresController } from "./entregadores.controller";
import { EntregadoresService } from "./entregadores.service";
import { PrismaService } from "src/prisma.service";

@Module({
  imports: [],
  controllers: [EntregadoresController],
  providers: [EntregadoresService, PrismaService],
})
export class EntregadoresModule {}
