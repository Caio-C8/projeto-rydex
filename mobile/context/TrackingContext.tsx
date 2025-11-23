import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { entregadoresService } from "../services/entregadores.service";
import { getDistanceFromLatLonInMeters } from "../utils/location.utils";
import { tratarErroApi } from "../utils/api-error-handler";

interface TrackingContextData {
  isOnline: boolean;
  toggleOnline: () => Promise<void>;
  isLoadingLocation: boolean;
  location: Location.LocationObject | null;
}

const TrackingContext = createContext<TrackingContextData>(
  {} as TrackingContextData
);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Refs para guardar o estado anterior sem forçar re-renderização desnecessária
  const lastSentLocation = useRef<{ lat: number; lon: number } | null>(null);
  const lastSentTimestamp = useRef<number>(0);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  // --- Regras de Negócio ---
  const DISTANCE_THRESHOLD = 100; // 100 metros
  const TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutos em milissegundos

  // Função interna para enviar ao backend
  const enviarLocalizacaoAPI = async (lat: number, lon: number) => {
    try {
      console.log("📍 [Tracking] Enviando localização atualizada...", lat, lon);
      await entregadoresService.atualizarLocalizacao({
        latitude: lat,
        longitude: lon,
      });

      // Atualiza as referências de controle
      lastSentLocation.current = { lat, lon };
      lastSentTimestamp.current = Date.now();
    } catch (error: any) {
      if (error.response) {
        console.error(
          "❌ Erro Backend 400:",
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        console.error("❌ Erro de Conexão:", error.message);
      }
    }
  };

  // Monitoramento de Localização
  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      // Se estiver offline, para o rastreamento e limpa a subscrição
      if (!isOnline) {
        if (locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null;
        }
        return;
      }

      // Verifica Permissões
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão Necessária",
          "Precisamos da sua localização para receber entregas."
        );
        setIsOnline(false); // Força offline se não der permissão
        return;
      }

      // 1. Envio Imediato ao ficar Online (Requisito: atualizar ao ficar online)
      try {
        const currentLoc = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          setLocation(currentLoc);
          enviarLocalizacaoAPI(
            currentLoc.coords.latitude,
            currentLoc.coords.longitude
          );
        }
      } catch (error) {
        console.error("Erro ao obter posição inicial", error);
      }

      // 2. Iniciar Watcher (Observador de Movimento)
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Recebe updates a cada 10 metros para verificar a lógica
          timeInterval: 5000, // Verifica a cada 5s
        },
        (newLoc) => {
          if (!isMounted) return;
          setLocation(newLoc); // Atualiza estado global para mapas UI

          const now = Date.now();
          const { latitude, longitude } = newLoc.coords;

          // Se nunca enviámos, envia agora
          if (!lastSentLocation.current) {
            enviarLocalizacaoAPI(latitude, longitude);
            return;
          }

          // Cálculos de Distância e Tempo
          const distance = getDistanceFromLatLonInMeters(
            lastSentLocation.current.lat,
            lastSentLocation.current.lon,
            latitude,
            longitude
          );

          const timeDiff = now - lastSentTimestamp.current;

          // CONDICIONAL PRINCIPAL:
          // Se distanciou > 100m OU passou > 5 minutos desde o último envio
          if (distance >= DISTANCE_THRESHOLD || timeDiff >= TIME_THRESHOLD) {
            enviarLocalizacaoAPI(latitude, longitude);
          }
        }
      );
    };

    startTracking();

    return () => {
      isMounted = false;
      if (locationSubscription.current) locationSubscription.current.remove();
    };
  }, [isOnline]); // Recria o efeito apenas se o status Online mudar

  // Ação de Toggle (Ligar/Desligar)
  const toggleOnline = async () => {
    if (isLoadingLocation) return;
    setIsLoadingLocation(true);

    try {
      if (!isOnline) {
        // Tenta ficar Online na API
        await entregadoresService.statusOnline();
        setIsOnline(true);
      } else {
        // Tenta ficar Offline na API
        await entregadoresService.statusOffline();
        setIsOnline(false);

        // Reseta referências ao ficar offline
        lastSentLocation.current = null;
        lastSentTimestamp.current = 0;
      }
    } catch (error) {
      const msg = tratarErroApi(error);
      Alert.alert("Erro", msg);
      // Se der erro ao tentar ficar online, garantimos que o state volte a false
      if (!isOnline) setIsOnline(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <TrackingContext.Provider
      value={{ isOnline, toggleOnline, isLoadingLocation, location }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
