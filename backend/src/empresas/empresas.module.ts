import { Module } from "@nestjs/common";
import { EmpresasController } from "./empresas.controller";
import { EmpresasServices } from "./empresas.service";
import { HttpModule } from "@nestjs/axios";
import { AuthModule } from "src/auth/auth.module";
import { PrismaModule } from "src/prisma.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, AuthModule, PrismaModule, ConfigModule],
  controllers: [EmpresasController],
  providers: [EmpresasServices],
})
export class EmpresasModule {}
