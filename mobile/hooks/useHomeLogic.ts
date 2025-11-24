import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import MapView, { Region } from "react-native-maps";

// --- Imports de Serviços e Tipos ---
import { socketService } from "../services/socket.service";
import { entregasService } from "../services/entregas.service";
import { NotificacaoSolicitacao, ResumoDia } from "../types/api.types";
import { entregadoresService } from "../services/entregadores.service";

// --- Import do Contexto Global ---
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
  // 1. Consumimos o Contexto Global
  const { isOnline, toggleOnline, location } = useTracking();

  // Refs para evitar "Stale Closure"
  const locationRef = useRef(location);
  const regionRef = useRef<Region | null>(null);

  // Mantém os refs atualizados
  useEffect(() => { locationRef.current = location; }, [location]);

  // --- Refs e Estados Visuais ---
  const mapRef = useRef<MapView>(null);
  const [appMode, setAppMode] = useState<AppMode>("OFFLINE");
  const [region, setRegion] = useState<Region>({
    latitude: -18.5792,
    longitude: -46.5176,
    latitudeDelta: 0.02,
    longitudeDelta: 0.01,
  });
  
  useEffect(() => { regionRef.current = region; }, [region]);

  // --- Estados da Corrida ---
  const [solicitation, setSolicitation] = useState<any | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [timer, setTimer] = useState(30);
  const [navInstruction, setNavInstruction] = useState("");
  const [currentDeliveryId, setCurrentDeliveryId] = useState<number | null>(null);

  // --- Estados de UI ---
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const [dailySummary, setDailySummary] = useState<ResumoDia>({
    ganhos: 0, aceitas: 0, finalizadas: 0, canceladas: 0, recusadas: 0,
  });

  const fetchDailySummary = async () => {
    try {
      const dados = await entregadoresService.obterResumoDia();
      setDailySummary(dados);
    } catch (error) {
      // Silencioso
    }
  };

  useEffect(() => { fetchDailySummary(); }, []);

  // ============================================================
  // --- 1. SINCRONIZAÇÃO ---
  // ============================================================
  useEffect(() => {
    if (isOnline) {
      if (appMode === "OFFLINE") setAppMode("IDLE_ONLINE");
      fetchDailySummary();
    } else {
      if (appMode !== "OFFLINE") {
        setAppMode("OFFLINE");
        setSolicitation(null);
        setRouteCoords([]);
      }
    }
  }, [isOnline]);

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
  // --- 2. SOCKET E EVENTOS (CORRIGIDO COM CALLBACK) ---
  // ============================================================

  // Usamos useCallback para que a função não mude a cada render e não desconecte o socket
  
  const handleNovaSolicitacao = useCallback((incomingData: any) => {
    console.log("🚨 [DEBUG] handleNovaSolicitacao DISPARADO!");
    
    let data;
    if (Array.isArray(incomingData)) {
        console.log("📦 [DEBUG] Dados vieram como Array.");
        data = incomingData[0];
    } else {
        data = incomingData;
    }
    console.log("📦 DADOS BRUTOS CHEGANDO:", JSON.stringify(data, null, 2));
    console.log("🏢 DADOS DA EMPRESA:", data.empresa);
    if (!data) {
        console.error("❌ [ERRO] Dados vazios.");
        return;
    }

    try {
        const empresa = data.empresa || {};
        const storeLat = parseFloat(String(empresa.latitude || 0));
        const storeLong = parseFloat(String(empresa.longitude || 0));
        
        const myLat = locationRef.current?.coords.latitude || regionRef.current?.latitude || -18.5792;
        const myLong = locationRef.current?.coords.longitude || regionRef.current?.longitude || -46.5176;

        const valorReais = data.valor_entregador ? Number(data.valor_entregador) / 100 : 0;
        const distanciaKm = data.distancia_m ? (data.distancia_m / 1000).toFixed(1) : "0.0";

        const newSolicitation = {
            id: `#${data.id}`,
            realSolicitacaoId: data.id,
            value: valorReais,
            storeName: empresa.nome_empresa || "Nova Entrega",
            pickupAddress: `${empresa.logradouro || ''}, ${empresa.numero || ''}`,
            deliveryAddress: `${data.logradouro || ''}, ${data.numero || ''}`,
            distanceLabel: `${distanciaKm} km`,
            notes: data.observacao || "",
            hasReturn: !!data.item_retorno,
            timer: 30,
            /*
            routeToPickup: [
                { latitude: myLat, longitude: myLong },
                { latitude: storeLat || myLat + 0.002, longitude: storeLong || myLong + 0.002 },
            ],*/
            routeToPickup: [
    // Ponto 1: A Loja (Onde vai ser a Coleta/Pino Laranja)
    { 
        latitude: storeLat, 
        longitude: storeLong 
    },
    { 
        latitude: parseFloat(data.latitude), 
        longitude: parseFloat(data.longitude) 
    },
],
        };

        console.log("✅ [SUCESSO] Card de solicitação ativado!");
        setSolicitation(newSolicitation);
        setRouteCoords(newSolicitation.routeToPickup);
        setAppMode("SOLICITATION");

        if (mapRef.current && newSolicitation.routeToPickup.length > 0) {
    console.log("📍 Ajustando câmera para cobrir a rota:", newSolicitation.routeToPickup);

    setTimeout(() => {
        mapRef.current?.fitToCoordinates(newSolicitation.routeToPickup, {
            edgePadding: { 
                top: 150,    // Espaço para o Header verde
                right: 50, 
                bottom: 350, // MUITO IMPORTANTE: Espaço grande para o Card Branco não tampar o ponto
                left: 50 
            },
            animated: true,
        });
    }, 1000); // Um delay um pouco maior para garantir que o modal abriu
}

    } catch (error) {
        console.error("🔥 [FATAL] Erro ao processar:", error);
    }
  }, []); // Dependências vazias para ser estável

  // --- O useEffect do Socket CORRIGIDO ---
  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
        if (isOnline) {
            console.log("🔌 [HOOK] Iniciando conexão...");
            
            // 1. AWAIT É CRUCIAL AQUI! Espera conectar antes de registrar
            await socketService.connect(); 
            
            if (!isMounted) return;

            console.log("👂 [HOOK] Registrando listener...");
            socketService.off("nova.solicitacao");
            socketService.on("nova.solicitacao", handleNovaSolicitacao);
        } else {
            console.log("zzz [HOOK] Desligando socket...");
            socketService.off("nova.solicitacao");
            socketService.disconnect();
        }
    };

    setupSocket();

    return () => {
        isMounted = false;
        socketService.off("nova.solicitacao");
    };
  }, [isOnline, handleNovaSolicitacao]);

  // ============================================================
  // --- 3. TIMER ---
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
  const handleToggleOnline = async () => {
    if (isLoadingAction) return;
    setIsLoadingAction(true);
    try { await toggleOnline(); } catch (error) { console.error(error); } finally { setIsLoadingAction(false); }
  };

  const handleAcceptSolicitation = async () => {
    if (!solicitation?.realSolicitacaoId) return;
    if (isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      const resposta = await entregasService.aceitarEntrega(solicitation.realSolicitacaoId);
      setCurrentDeliveryId(resposta.entrega.id);
      setNavInstruction("Dirija-se ao estabelecimento para coleta");
      setAppMode("EN_ROUTE_PICKUP");
      fetchDailySummary();
    } catch (error) {
      Alert.alert("Atenção", "Esta corrida já não está disponível.");
      handleRejectSolicitation();
    } finally { setIsLoadingAction(false); }
  };

  const handleRejectSolicitation = () => {
    setSolicitation(null); setRouteCoords([]); setTimer(30); setAppMode("IDLE_ONLINE"); fetchDailySummary();
  };

  const simulateReceiveSolicitation = () => {
    // Mock data mantido igual...
    const myLat = locationRef.current?.coords.latitude || -18.5792;
    const myLong = locationRef.current?.coords.longitude || -46.5176;
    const mockData: any = {
      id: 999, valor_entregador: 1850, distancia_m: 3200, item_retorno: false, status: "pendente",
      logradouro: "Av. Teste", numero: "100", latitude: -18.585, longitude: -46.52,
      empresa: { id: 1, nome_empresa: "Burger King Mock", logradouro: "Rua Principal", numero: "50", latitude: myLat + 0.005, longitude: myLong + 0.005 },
    };
    handleNovaSolicitacao(mockData);
  };

  const handleArrivedPickup = () => {
    setNavInstruction("Aguardando coleta...");
    setTimeout(() => { setNavInstruction("Levar pedido ao cliente"); setAppMode("EN_ROUTE_DELIVERY"); }, 2000);
  };
  
  const handleArrivedDelivery = () => { setNavInstruction("Entregar o pedido"); };

  const handleFinishDelivery = async () => {
    if (!currentDeliveryId) return;
    if (isLoadingAction) return;
    setIsLoadingAction(true);
    try {
      await entregasService.finalizarEntrega(currentDeliveryId);
      fetchDailySummary();
      setNavInstruction("Entrega Finalizada!");
      setSolicitation(null); setRouteCoords([]); setAppMode("DELIVERY_FINISHED"); setCurrentDeliveryId(null);
      setTimeout(() => { setAppMode("IDLE_ONLINE"); setNavInstruction(""); recenterMap(); }, 3000);
    } catch (e) { Alert.alert("Erro", "Erro ao finalizar"); } finally { setIsLoadingAction(false); }
  };

  const handleCancelDelivery = async () => {
    if (!currentDeliveryId) return;
    try {
      await entregasService.cancelarEntrega(currentDeliveryId);
      fetchDailySummary();
      setNavInstruction(""); setSolicitation(null); setRouteCoords([]); setAppMode("IDLE_ONLINE"); setCurrentDeliveryId(null);
      Alert.alert("Corrida Cancelada");
    } catch (e) { Alert.alert("Erro", "Erro ao cancelar"); }
  };

  const toggleSummaryExpansion = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsSummaryExpanded(!isSummaryExpanded); };

  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera({ center: location.coords, zoom: 15 }, { duration: 1000 });
    }
  };

  return {
    appMode, isOnline, solicitation, timer, region, routeCoords,
    navInstruction, isSummaryExpanded, location, errorMsg, mapRef,
    dailySummary, setRegion, handleToggleOnline, simulateReceiveSolicitation,
    handleAcceptSolicitation, handleRejectSolicitation, handleArrivedPickup,
    handleArrivedDelivery, handleFinishDelivery, handleCancelDelivery,
    toggleSummaryExpansion, recenterMap, setNavInstruction,
  };
};