
import { Module } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { SolicitacoesController } from './solicitacoes.controller';
import { PrismaModule } from '../prisma.module';

// 1. Verifique se esta linha existe
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    // 2. Verifique se esta linha existe
    EventEmitterModule,
  ],
  controllers: [SolicitacoesController],
  providers: [SolicitacoesService],
})
export class SolicitacoesModule {}