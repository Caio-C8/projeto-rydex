import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { TipoUsuario } from "src/auth/dto/login.dto";
import { NotificacaoSolicitacao } from "./dto/notificacao-solicitacao.dto";
import { OnEvent } from "@nestjs/event-emitter"; // <--- O Import correto para o Backend

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EntregasGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EntregasGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log("Gateway de entregas inicializado.");
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers["authorization"];

      if (!token) {
        throw new Error("Token de autenticação não fornecido.");
      }

      const tokenLimpo = token.replace("Bearer ", "");
      const payload = await this.jwtService.verifyAsync(tokenLimpo);

      const usuarioId = payload.sub;

      if (!usuarioId) {
        throw new Error("Token inválido.");
      }

      if (payload.tipo === TipoUsuario.ENTREGADOR) {
        const roomName = `entregador-${usuarioId}`;
        client.join(roomName);
        this.logger.log(`Entregador conectado na sala: ${roomName}`);
      } else if (payload.tipo === TipoUsuario.EMPRESA) {
        const roomName = `empresa-${usuarioId}`;
        client.join(roomName);
        this.logger.log(`Empresa conectada na sala: ${roomName}`);
      } else {
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Falha na conexão do socket: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket desconectado: ${client.id}`);
  }

  notificarEntregador(
    entregadorId: string,
    solicitacao: NotificacaoSolicitacao
  ) {
    this.server
      .to(`entregador-${entregadorId}`)
      .emit("nova.solicitacao", solicitacao);
  }

  notificarEmpresaStatus(
    empresaId: number,
    dados: {
      solicitacaoId: number;
      status: string;
      mensagem: string;
      entregadorNome?: string;
    }
  ) {
    this.server.to(`empresa-${empresaId}`).emit("status.entrega", dados);
    this.logger.log(`Notificação de status enviada para empresa ${empresaId}`);
  }

  // 👇 OUVINTE DE EVENTOS INTERNOS (DO SERVICE)
  @OnEvent("solicitacao.cancelada")
  handleSolicitacaoCancelada(payload: any) {
    this.logger.log(
      `Notificando cancelamento da solicitação #${payload.id} para empresa ${payload.empresa_id}`
    );
    // Envia o aviso para a sala "empresa-ID"
    this.server
      .to(`empresa-${payload.empresa_id}`)
      .emit("solicitacao.cancelada", payload);
  }
}