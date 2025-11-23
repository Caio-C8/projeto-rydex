import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Usa a URL do teu .env
const API_URL = process.env.EXPO_PUBLIC_API_URL;

class SocketService {
  private socket: Socket | null = null;

  /**
   * Conecta ao WebSocket enviando o Token JWT
   */
  async connect(): Promise<void> {
    const token = await AsyncStorage.getItem("user_token");

    if (!token) {
      console.warn("Tentativa de conexão socket sem token.");
      return;
    }

    // Evita recriar conexão se já existir e estiver conectado
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(API_URL, {
      auth: {
        token: `Bearer ${token}`, // O teu Gateway espera isso no handshake.auth
      },
      transports: ["websocket"], // Força websocket para melhor performance no React Native
    });

    this.socket.on("connect", () => {
      console.log("🔥 Socket Conectado:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.log("❌ Erro conexão Socket:", err.message);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Socket Desconectado");
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
   * Para de escutar eventos para evitar vazamento de memória
   */
  off(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }
}

export const socketService = new SocketService();