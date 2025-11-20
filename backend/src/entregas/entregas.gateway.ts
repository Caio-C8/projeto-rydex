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
import { NotificacaoSolicitacao } from "./dto/notificacao-solicitacao.dto";

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

      client.join(entregadorIdString);

      this.logger.log(
        `Entregador conectado e adicionado à sala ${entregadorIdString} (Socket: ${client.id})`
      );

      this.logger.log(
        `Atualmente conectados: ${this.server.engine.clientsCount}`
      );
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
    this.server.to(entregadorId).emit("nova.solicitacao", solicitacao);

    this.logger.log(
      `Notificação enviada para a sala do Entregador: ${entregadorId}`
    );
  }
}
