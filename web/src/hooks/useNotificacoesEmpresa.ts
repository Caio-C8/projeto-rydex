import { useEffect } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

// VERIFIQUE SE A PORTA ESTÁ CORRETA PARA SEU BACKEND
const SOCKET_URL = "http://localhost:3000";

// Aceitamos a função setSolicitacoes como opcional para atualizar a lista na tela
export const useNotificacoesEmpresa = (
  setSolicitacoes?: React.Dispatch<React.SetStateAction<any[]>>
) => {
  useEffect(() => {
    const usuarioJson = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    console.log("Hook de notificações iniciado.");

    if (!usuarioJson || !token) {
      return;
    }

    const usuario = JSON.parse(usuarioJson);

    // Validação flexível para aceitar "EMPRESA" ou "empresa"
    if (usuario.tipo !== "EMPRESA" && usuario.tipo !== "empresa") {
      return;
    }

    // Conexão com o Socket
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

    // --- 1. OUVINTE DE STATUS GERAL (Atribuída, Finalizada, etc) ---
    socket.on("status.entrega", (dados: any) => {
      console.log("🔔 Status recebido:", dados);

      const { solicitacaoId, status, mensagem, entregadorNome } = dados;

      const opcoesToast = {
        position: "top-right" as const,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      };

      // Notificações visuais (Toasts)
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

      // Atualiza a lista na tela, trocando o status do item correspondente
      if (setSolicitacoes) {
        setSolicitacoes((prev) =>
          prev.map((item) =>
            item.id === solicitacaoId ? { ...item, status: status } : item
          )
        );
      }
    });

    // --- 2. OUVINTE DE CANCELAMENTO AUTOMÁTICO (TIMEOUT) ---
    socket.on("solicitacao.cancelada", (cancelada: any) => {
      console.log("🚫 Cancelamento recebido via socket:", cancelada);

      // Feedback visual imediato
      toast.error(`⏳ Tempo esgotado! Pedido #${cancelada.id} cancelado.`);

      // Atualiza a lista na tela para ficar vermelha, sem remover o item
      if (setSolicitacoes) {
        setSolicitacoes((listaAtual) =>
          listaAtual.map((item) => {
            if (item.id === cancelada.id) {
              return { ...item, status: "cancelada" };
            }
            return item;
          })
        );
      }
    });

    // Limpeza ao desmontar
    return () => {
      console.log("Desconectando socket...");
      socket.disconnect();
    };
  }, [setSolicitacoes]); // Dependência importante
};