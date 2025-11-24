import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Garante que tens a variável de ambiente configurada no .env do mobile
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:3000";

class SocketService {
  private socket: Socket | null = null;

  /**
   * Conecta ao WebSocket enviando o Token JWT
   */
  async connect(): Promise<void> {
    const token = await AsyncStorage.getItem("user_token");

    if (!token) {
      console.warn("⚠️ Tentativa de conexão socket sem token.");
      return;
    }

    // Evita recriar conexão se já existir e estiver conectado
    if (this.socket && this.socket.connected) {
      return;
    }

    // Se houver uma instância desconectada, limpa antes de criar nova
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(API_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket"], // Força websocket para melhor performance no React Native
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("🔥 Socket Conectado ID:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.log("❌ Erro conexão Socket:", err.message);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Socket Desconectado");
    });

    this.socket.onAny((event, ...args) => {
      console.log(`⚡ [SOCKET DEBUG] Evento recebido: ${event}`, args);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Escuta eventos específicos (Ex: "nova.solicitacao")
   */
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  /**
   * Para de escutar eventos para evitar vazamento de memória ou duplicação
   */
  off(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }
}

export const socketService = new SocketService();
