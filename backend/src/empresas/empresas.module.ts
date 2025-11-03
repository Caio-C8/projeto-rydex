import { Module } from "@nestjs/common";
import { EmpresasController } from "./empresas.controller";
import { EmpresasServices } from "./empresas.service";
import { PrismaService } from "src/prisma.service";
import { HttpModule } from "@nestjs/axios";
@Module({
  imports: [HttpModule],
  controllers: [EmpresasController],
  providers: [EmpresasServices, PrismaService],
})
export class EmpresasModule {}
