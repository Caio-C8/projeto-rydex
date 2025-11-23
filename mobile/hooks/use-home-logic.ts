import { useState, useEffect, useRef } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import MapView, { Region } from "react-native-maps";

// --- Imports de Serviços e Tipos ---
import { socketService } from "../services/socket.service";
import { entregasService } from "../services/entregas.service";
import { NotificacaoSolicitacao } from "../types/api.types";

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
  // 1. Consumimos o Contexto Global (A inteligência de GPS e Status está aqui agora)
  const { isOnline, toggleOnline, location } = useTracking();

  // --- Refs e Estados Visuais ---
  const mapRef = useRef<MapView>(null);
  const [appMode, setAppMode] = useState<AppMode>("OFFLINE");
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
      // Se virou Offline, reseta tudo
      if (appMode !== "OFFLINE") {
        setAppMode("OFFLINE");
        setSolicitation(null);
        setRouteCoords([]);
      }
    }
  }, [isOnline]);

  // Atualiza a região do mapa inicialmente quando obtemos a primeira localização
  // (Mas não força o recentramento constante para não atrapalhar o usuário se ele mexer no mapa)
  useEffect(() => {
    if (location && appMode === "OFFLINE") {
      // Apenas na inicialização ou offline
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      });
    }
  }, [location]); // Dependência simples

  // ============================================================
  // --- 2. SOCKET E EVENTOS (RECEBIMENTO DE PEDIDOS) ---
  // ============================================================

  const handleNovaSolicitacao = (data: NotificacaoSolicitacao) => {
    console.log("🔔 Nova Solicitação via Socket:", data);

    const distanciaKm = (data.distancia_m / 1000).toFixed(1);

    // Mapeia DTO -> Formato UI
    const newSolicitation = {
      id: `#${data.id}`,
      realSolicitacaoId: data.id,

      value: data.valor_entregador / 100,
      storeName: data.empresa.nome_empresa,

      pickupAddress: `${data.empresa.logradouro}, ${data.empresa.numero} - ${data.empresa.bairro}`,
      deliveryAddress: `${data.logradouro}, ${data.numero} - ${data.bairro}`,

      distanceLabel: `${distanciaKm} km`,
      notes: data.observacao,
      hasReturn: data.item_retorno,
      timer: 30,

      // Rota: Local Atual (Global) -> Empresa
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

    // Animação de Câmera
    if (mapRef.current && newSolicitation.routeToPickup.length > 0) {
      mapRef.current.fitToCoordinates(newSolicitation.routeToPickup, {
        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  // Gerencia conexão do Socket baseado no isOnline Global
  useEffect(() => {
    if (isOnline) {
      socketService.connect();
      socketService.on("nova.solicitacao", handleNovaSolicitacao);
    } else {
      socketService.off("nova.solicitacao");
      socketService.disconnect();
    }

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
            handleRejectSolicitation();
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

  // Botão Switch Online/Offline
  const handleToggleOnline = async () => {
    if (isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      await toggleOnline(); // Chama a função do Contexto
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

      // Aqui você poderia chamar uma API de rotas (Google Directions) para desenhar o trajeto real nas ruas
      // Por enquanto mantemos a linha reta ou a rota que veio da solicitação
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

  // --- Simulação (Para Testes) ---
  const simulateReceiveSolicitation = () => {
    const mockData: NotificacaoSolicitacao = {
      id: Math.floor(Math.random() * 1000),
      valor_entregador: 1850,
      distancia_m: 3200,
      item_retorno: false,
      status: "pendente",
      cep: "00000-000",
      cidade: "Simulação",
      bairro: "Bairro Teste",
      logradouro: "Av. Teste",
      numero: "100",
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

  // --- Fluxo de Corrida (Mockado no Front por enquanto, mas com ID real) ---
  const handleArrivedPickup = () => {
    setNavInstruction("Aguardando coleta...");
    // Simula tempo de espera no restaurante
    setTimeout(() => {
      setNavInstruction("Levar pedido ao cliente");

      // Define rota da Loja -> Cliente
      if (solicitation) {
        const rotaEntrega = [
          {
            latitude: solicitation.routeToPickup[1].latitude,
            longitude: solicitation.routeToPickup[1].longitude,
          }, // Origem: Loja
          { latitude: -18.585, longitude: -46.52 }, // Destino: Cliente (Mock ou real se viesse no payload)
        ];
        setRouteCoords(rotaEntrega);
        mapRef.current?.fitToCoordinates(rotaEntrega, {
          edgePadding: { top: 50, right: 50, bottom: 150, left: 50 },
        });
      }
      setAppMode("EN_ROUTE_DELIVERY");
    }, 3000);
  };

  const handleFinishDelivery = async () => {
    if (!currentDeliveryId) return;
    try {
      await entregasService.finalizarEntrega(currentDeliveryId);
      setNavInstruction("");
      setSolicitation(null);
      setRouteCoords([]);
      setAppMode("DELIVERY_FINISHED");
      setTimeout(() => setAppMode("IDLE_ONLINE"), 3000);
    } catch (e) {
      Alert.alert("Erro", "Erro ao finalizar");
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
    handleFinishDelivery,
    handleCancelDelivery,
    toggleSummaryExpansion,
    recenterMap,
  };
};
