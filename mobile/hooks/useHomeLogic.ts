import { useState, useEffect, useRef } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import MapView, { Region } from "react-native-maps";

// --- Imports de Serviços e Tipos ---
import { socketService } from "../services/socket.service";
import { entregasService } from "../services/entregas.service";
import { NotificacaoSolicitacao } from "../types/api.types";
import { entregadoresService } from "../services/entregadores.service";
import { tratarErroApi } from "@/utils/api-error-handler";

// --- Import do Novo Contexto Global ---
import { useTracking } from "../context/TrackingContext";

// Habilita animação no Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type AppMode =
  | "OFFLINE"
  | "IDLE_ONLINE"
  | "SOLICITATION"
  | "EN_ROUTE_PICKUP"
  | "EN_ROUTE_DELIVERY"
  | "DELIVERY_FINISHED";

export const useHomeLogic = () => {
  // 1. Consumimos o Contexto Global (A inteligência de GPS e Status vem daqui)
  const { isOnline, toggleOnline, location } = useTracking();

  // --- Refs e Estados Visuais ---
  const mapRef = useRef<MapView>(null);
  const [appMode, setAppMode] = useState<AppMode>("OFFLINE");
  // Estado inicial do mapa (pode ser ajustado para a tua cidade padrão)
  const [region, setRegion] = useState<Region>({
    latitude: -18.5792,
    longitude: -46.5176,
    latitudeDelta: 0.02,
    longitudeDelta: 0.01,
  });

  // --- Estados da Corrida ---
  const [solicitation, setSolicitation] = useState<any | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [timer, setTimer] = useState(30);
  const [navInstruction, setNavInstruction] = useState("");
  const [currentDeliveryId, setCurrentDeliveryId] = useState<number | null>(
    null
  );

  // --- Estados de UI ---
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // ============================================================
  // --- 1. SINCRONIZAÇÃO: CONTEXTO GLOBAL <-> UI LOCAL ---
  // ============================================================

  // Sincroniza o modo visual do App com o status real do Contexto
  useEffect(() => {
    if (isOnline) {
      // Se virou Online e estava Offline, vai para IDLE
      if (appMode === "OFFLINE") setAppMode("IDLE_ONLINE");
    } else {
      // Se virou Offline, reseta tudo para garantir consistência
      if (appMode !== "OFFLINE") {
        setAppMode("OFFLINE");
        setSolicitation(null);
        setRouteCoords([]);
      }
    }
  }, [isOnline]);

  // Atualiza a região do mapa quando obtemos a localização e estamos "seguindo" o utilizador
  // (Geralmente na inicialização ou quando ele clica para recentrar)
  useEffect(() => {
    if (location && appMode === "OFFLINE" && !region.latitude) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

  // ============================================================
  // --- 2. SOCKET E EVENTOS (RECEBIMENTO DE PEDIDOS) ---
  // ============================================================

  const handleNovaSolicitacao = (data: NotificacaoSolicitacao) => {
    console.log("🚀 [MOBILE] EVENTO RECEBIDO DO SOCKET!", data);
    console.log("🔔 Nova Solicitação via Socket:", data);

    const distanciaKm = (data.distancia_m / 1000).toFixed(1);

    // Mapeia DTO do Backend -> Formato usado na UI (SolicitationCard)
    const newSolicitation = {
      id: `#${data.id}`,
      realSolicitacaoId: data.id,

      value: data.valor_entregador / 100, // Converte centavos para Reais
      storeName: data.empresa.nome_empresa,

      pickupAddress: `${data.empresa.logradouro}, ${data.empresa.numero} - ${data.empresa.bairro}`,
      deliveryAddress: `${data.logradouro}, ${data.numero} - ${data.bairro}`,

      distanceLabel: `${distanciaKm} km`,
      notes: data.observacao,
      hasReturn: data.item_retorno,
      timer: 30,

      // Cria uma linha reta da posição atual até a loja (para visualização inicial)
      routeToPickup: [
        {
          latitude: location?.coords.latitude || 0,
          longitude: location?.coords.longitude || 0,
        },
        { latitude: data.empresa.latitude, longitude: data.empresa.longitude },
      ],
    };

    setSolicitation(newSolicitation);
    setRouteCoords(newSolicitation.routeToPickup);
    setAppMode("SOLICITATION");

    // Animação de Câmera para focar na rota proposta
    if (mapRef.current && newSolicitation.routeToPickup.length > 0) {
      mapRef.current.fitToCoordinates(newSolicitation.routeToPickup, {
        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  // Gerencia conexão do Socket baseado no isOnline Global
  useEffect(() => {
    const setupSocket = async () => {
      if (isOnline) {
        console.log("🔌 [MOBILE] Iniciando conexão socket...");
        await socketService.connect(); // Adicione await aqui se transformar o connect em Promise

        // Pequeno delay de segurança ou verificação
        console.log("👂 [MOBILE] Ouvindo eventos...");
        socketService.on("nova.solicitacao", handleNovaSolicitacao);
      } else {
        socketService.off("nova.solicitacao");
        socketService.disconnect();
      }
    };
    setupSocket();

    return () => {
      socketService.off("nova.solicitacao");
    };
  }, [isOnline]);

  // ============================================================
  // --- 3. TIMER (CONTAGEM REGRESSIVA) ---
  // ============================================================
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appMode === "SOLICITATION" && solicitation) {
      setTimer(solicitation.timer);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleRejectSolicitation(); // Rejeita automaticamente se acabar o tempo
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appMode, solicitation]);

  // ============================================================
  // --- 4. AÇÕES E HANDLERS ---
  // ============================================================

  // Botão Switch Online/Offline (Chama o Contexto)
  const handleToggleOnline = async () => {
    if (isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      await toggleOnline();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Aceitar Corrida
  const handleAcceptSolicitation = async () => {
    if (!solicitation?.realSolicitacaoId) return;
    if (isLoadingAction) return;

    setIsLoadingAction(true);
    try {
      const resposta = await entregasService.aceitarEntrega(
        solicitation.realSolicitacaoId
      );

      setCurrentDeliveryId(resposta.entrega.id);
      setNavInstruction("Dirija-se ao estabelecimento para coleta");
      setAppMode("EN_ROUTE_PICKUP");

      // Aqui poderias chamar uma API de rotas para atualizar o routeCoords com o trajeto real das ruas
    } catch (error) {
      Alert.alert("Atenção", "Esta corrida já não está disponível.");
      handleRejectSolicitation();
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Rejeitar Corrida
  const handleRejectSolicitation = () => {
    setSolicitation(null);
    setRouteCoords([]);
    setTimer(30);
    setAppMode("IDLE_ONLINE");
  };

  // --- Simulação (Para Testes sem Backend) ---
  const simulateReceiveSolicitation = () => {
    const mockData: NotificacaoSolicitacao = {
      id: Math.floor(Math.random() * 1000),
      valor_entregador: 1850, // R$ 18,50
      distancia_m: 3200,
      item_retorno: false,
      status: "pendente",
      cep: "00000-000",
      cidade: "Simulação",
      bairro: "Bairro Teste",
      logradouro: "Av. Teste",
      numero: "100",
      // Usa localização atual simulada se não houver real
      latitude: -18.585,
      longitude: -46.52,
      empresa: {
        id: 1,
        nome_empresa: "Burger King Simulado",
        cep: "00000-000",
        cidade: "Cidade",
        bairro: "Centro",
        logradouro: "Rua Principal",
        numero: "50",
        latitude: -18.579,
        longitude: -46.51,
      },
    };
    handleNovaSolicitacao(mockData);
  };

  // --- Fluxo da Corrida (Exemplos de Handlers) ---

  const handleArrivedPickup = () => {
    // Aqui você poderia adicionar uma validação de geolocalização se quisesse

    setNavInstruction("Dirija-se ao cliente");

    // Muda o estado para "Em Rota de Entrega"
    // Isso fará o DeliveryActions mostrar o botão "CHEGUEI NO CLIENTE"
    setAppMode("EN_ROUTE_DELIVERY");

    // Opcional: Atualizar o mapa para focar no destino (Cliente)
    if (solicitation && mapRef.current) {
      // Exemplo: Focar na coordenada do cliente (mockada ou real do objeto solicitation)
      const destLat = solicitation.routeToPickup[1].latitude; // Assumindo que guardamos isso
      const destLon = solicitation.routeToPickup[1].longitude;

      // Se tiveres coordenadas reais do cliente no objeto, usa-as aqui
      // mapRef.current.animateCamera({ center: { latitude: destLat, longitude: destLon }, zoom: 17 });
    }
  };

  const handleArrivedDelivery = () => {
    // Esta string específica "Entregar o pedido" é o gatilho visual no seu DeliveryActions.tsx
    // para mostrar o botão "FINALIZAR ENTREGA"
    setNavInstruction("Entregar o pedido");
  };

  const handleFinishDelivery = async () => {
    if (!currentDeliveryId) {
      Alert.alert("Erro", "ID da entrega não encontrado.");
      return;
    }

    if (isLoadingAction) return;
    setIsLoadingAction(true);

    try {
      // Chama o Backend para finalizar e creditar o saldo
      await entregasService.finalizarEntrega(currentDeliveryId);

      // Feedback Visual
      setNavInstruction("Entrega Finalizada com Sucesso!");
      setAppMode("DELIVERY_FINISHED");
      setSolicitation(null);
      setRouteCoords([]);
      setCurrentDeliveryId(null);

      // Aguarda 3 segundos mostrando a mensagem de sucesso e volta para o mapa limpo
      setTimeout(() => {
        setAppMode("IDLE_ONLINE");
        setNavInstruction("");
        // Recentra o mapa no entregador
        if (location) {
          mapRef.current?.animateCamera({ center: location.coords, zoom: 15 });
        }
      }, 3000);
    } catch (error) {
      const msg = tratarErroApi(error);
      Alert.alert("Erro ao finalizar", msg);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCancelDelivery = async () => {
    if (!currentDeliveryId) return;
    try {
      await entregasService.cancelarEntrega(currentDeliveryId);
      setNavInstruction("");
      setSolicitation(null);
      setRouteCoords([]);
      setAppMode("IDLE_ONLINE");
      Alert.alert("Corrida Cancelada");
    } catch (e) {
      Alert.alert("Erro", "Erro ao cancelar");
    }
  };

  // UI Helpers
  const toggleSummaryExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSummaryExpanded(!isSummaryExpanded);
  };

  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera(
        { center: location.coords, zoom: 15 },
        { duration: 1000 }
      );
    }
  };

  return {
    // Estado
    appMode,
    isOnline, // Vem do Contexto
    solicitation,
    timer,
    region,
    routeCoords,
    navInstruction,
    isSummaryExpanded,
    location, // Vem do Contexto
    errorMsg,
    mapRef,

    // Ações
    setRegion,
    handleToggleOnline,
    simulateReceiveSolicitation,
    handleAcceptSolicitation,
    handleRejectSolicitation,
    handleArrivedPickup,
    handleArrivedDelivery,
    handleFinishDelivery,
    handleCancelDelivery,
    toggleSummaryExpansion,
    recenterMap,
    setNavInstruction,
  };
};
