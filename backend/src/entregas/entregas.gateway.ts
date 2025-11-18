import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { SolicitacoesEntregas } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { TipoUsuario } from "src/auth/dto/login.dto";

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

  private entregadoresConectados = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log("Gateway de entregas inicializado.");
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new Error("Token de autenticação não fornecido.");
      }

      const payload = await this.jwtService.verifyAsync(token);

      const entregadorIdNumerico = payload.sub;

      if (payload.tipo !== TipoUsuario.ENTREGADOR) {
        throw new Error(
          "Apenas entregadores podem conectar-se a este gateway."
        );
      }

      if (!entregadorIdNumerico) {
        throw new Error("Token inválido ou não contém ID.");
      }

      const entregadorIdString = String(entregadorIdNumerico);

      this.entregadoresConectados.set(entregadorIdString, client.id);

      this.logger.log(
        `Entregador conectado: ${entregadorIdString} (Socket: ${client.id})`
      );
      this.logger.log(
        `Atualmente conectados: ${this.entregadoresConectados.size}`
      );

      client.join(entregadorIdString);
    } catch (error) {
      this.logger.error(`Falha na conexão do socket: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    let entregadorId: string | null = null;
    for (const [key, value] of this.entregadoresConectados.entries()) {
      if (value === client.id) {
        entregadorId = key;
        break;
      }
    }

    if (entregadorId) {
      this.entregadoresConectados.delete(entregadorId);
      this.logger.log(
        `Entregador desconectado: ${entregadorId} (Socket: ${client.id})`
      );
    } else {
      this.logger.log(
        `Socket desconectado antes da autenticação: ${client.id}`
      );
    }
  }

  notificarEntregador(entregadorId: string, solicitacao: SolicitacoesEntregas) {
    const socketId = this.entregadoresConectados.get(entregadorId);

    if (socketId) {
      this.server.to(socketId).emit("nova.solicitacao", solicitacao);
      this.logger.log(
        `Notificação enviada para Entregador: ${entregadorId} (Socket: ${socketId})`
      );
    } else {
      this.logger.warn(
        `Tentativa de notificar entregador ${entregadorId}, mas ele não está conectado.`
      );
    }
  }
}
