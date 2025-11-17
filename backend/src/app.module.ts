//
// ──────────────────────────────────────────────────────────
//   Arquivo: backend/src/app.module.ts (Completo com "Plano B")
// ──────────────────────────────────────────────────────────
//
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntregadoresModule } from './entregadores/entregadores.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EmpresasModule } from './empresas/empresas.module';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';

// --- Nossas Adições ---
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module';
// --- Fim das Adições ---

@Module({
  imports: [
    // --- ESTA É A CORREÇÃO (PLANO B) ---
    // Tornamos o "Sistema de Sinos" global.
    EventEmitterModule.forRoot({
      global: true,
    }),
    // --- FIM DA CORREÇÃO ---

    SolicitacoesModule, // O seu módulo (correto)

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/public',
    }),
    PrismaModule,
    EntregadoresModule,
    EmpresasModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}