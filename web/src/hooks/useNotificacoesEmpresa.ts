import { useEffect } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

// VERIFIQUE SE A PORTA ESTÁ CORRETA (Geralmente NestJS roda na 3000, 3001 ou 3333)
const SOCKET_URL = "http://localhost:3000";

export const useNotificacoesEmpresa = () => {
  useEffect(() => {
    const usuarioJson = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    console.log("Hook iniciado via Layout"); // DEBUG

    if (!usuarioJson || !token) {
      console.log("Sem usuário ou token no localStorage"); // DEBUG
      return;
    }

    const usuario = JSON.parse(usuarioJson);
    console.log("Usuário lido:", usuario); // DEBUG

    // PROBLEMA COMUM: Verifique se o tipo vem como "EMPRESA", "empresa" ou número 1
    // O Backend espera enum. Se vier minúsculo, o if falha.
    // Vamos deixar mais flexível para teste:
    if (usuario.tipo !== "EMPRESA" && usuario.tipo !== "empresa") {
      console.log("Tipo de usuário ignorado:", usuario.tipo); // DEBUG
      return;
    }

    console.log("Tentando conectar ao Socket em:", SOCKET_URL); // DEBUG

    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado ao servidor Socket.IO! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erro de conexão Socket:", err.message);
    });

    socket.on("status.entrega", (dados: any) => {
      console.log("🔔 Notificação recebida no evento status.entrega:", dados);

      const { solicitacaoId, status, mensagem, entregadorNome } = dados;

      const opcoesToast = {
        position: "top-right" as const,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      };

      switch (status) {
        case "atribuida":
          toast.success(
            `🚀 Entrega #${solicitacaoId}: Aceita por ${
              entregadorNome || "Entregador"
            }!`,
            opcoesToast
          );
          break;
        case "finalizada":
          toast.info(`✅ Entrega #${solicitacaoId} finalizada!`, opcoesToast);
          break;
        case "cancelada":
          toast.error(`❌ Entrega #${solicitacaoId} cancelada.`, opcoesToast);
          break;
        default:
          toast(mensagem);
      }
    });

    return () => {
      console.log("Desconectando socket...");
      socket.disconnect();
    };
  }, []);
};
