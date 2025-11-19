import { Module } from "@nestjs/common";
import { EmpresasController } from "./empresas.controller";
import { EmpresasServices } from "./empresas.service";
import { HttpModule } from "@nestjs/axios";
import { AuthModule } from "src/auth/auth.module";
@Module({
  imports: [HttpModule, AuthModule],
  controllers: [EmpresasController],
  providers: [EmpresasServices],
})
export class EmpresasModule {}
