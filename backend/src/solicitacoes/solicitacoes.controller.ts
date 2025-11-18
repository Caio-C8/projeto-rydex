//
// ──────────────────────────────────────────────────────────────────
//   Arquivo: backend/src/solicitacoes/solicitacoes.controller.ts (Corrigido)
// ──────────────────────────────────────────────────────────────────
//
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// --- ESTAS SÃO AS LINHAS CORRIGIDAS ---
// Nós removemos as subpastas como /guards/ e /decorators/
import { Usuario } from '../auth/usuario.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UsuarioPayload } from '../auth/jwt.strategy'; // ✅ O Gerente está feliz
// --- FIM DAS CORREÇÕES ---

import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';
import { SolicitacoesService } from './solicitacoes.service';
import { EmpresaGuard } from 'src/auth/guards/empresa.guard';

@ApiTags('Solicitações (Empresa)')
@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  /**
   * (EMPRESA) Cria uma nova solicitação de entrega.
   */
  @Post()
  @UseGuards(JwtAuthGuard, EmpresaGuard)
  async criarSolicitacao(
    @Body() dto: CriarSolicitacaoDto,
    @Usuario() empresa: UsuarioPayload,
  ) {
    return this.solicitacoesService.criarSolicitacaoEntrega(dto, empresa.sub);
  }
}