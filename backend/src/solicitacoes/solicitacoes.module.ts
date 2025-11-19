import { Module } from "@nestjs/common";
import { SolicitacoesService } from "./solicitacoes.service";
import { SolicitacoesController } from "./solicitacoes.controller";
import { PrismaModule } from "../prisma.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [PrismaModule, EventEmitterModule, AuthModule],
  controllers: [SolicitacoesController],
  providers: [SolicitacoesService],
})
export class SolicitacoesModule {}
