import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

// --- Imports de Lógica e Estilos ---
import { useHomeLogic } from "../../hooks/use-home-logic";
import {
  COLORS,
  moderateScale,
  verticalScale,
  horizontalScale,
  SPACING,
} from "../../constants/home-styles";

// --- Imports dos Componentes Visuais ---
import { StatusHeader } from "../../components/status-header";
import { SummaryCard } from "../../components/summary-card";
import { SolicitationCard } from "../../components/solicitation-card";
import { DeliveryActions } from "../../components/delivery-actions";

// Altura estimada da TabBar para cálculos de padding do mapa
const TAB_BAR_HEIGHT = verticalScale(80);

const HomeScreen: React.FC = () => {
  // Instanciamos o Hook.
  // Nota: A lógica de GPS, Socket e Status Online agora vem toda daqui (via TrackingContext)
  const logic = useHomeLogic();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={logic.isOnline ? COLORS.online : COLORS.offline}
      />

      <View style={styles.mapContainer}>
        <MapView
          ref={logic.mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          region={logic.region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onRegionChangeComplete={logic.setRegion}
          // Padding ajustado para que o logo do Google não fique escondido atrás dos cards
          mapPadding={{
            top: verticalScale(100),
            right: 0,
            bottom: verticalScale(100 + TAB_BAR_HEIGHT),
            left: 0,
          }}
        >
          {/* Desenha a linha da rota (Azul) */}
          {logic.routeCoords.length > 0 && (
            <Polyline
              coordinates={logic.routeCoords}
              strokeColor={COLORS.mapBlue}
              strokeWidth={4}
            />
          )}

          {/* Marcadores de Coleta (Laranja) e Entrega (Verde) */}
          {logic.solicitation &&
            logic.appMode !== "IDLE_ONLINE" &&
            logic.appMode !== "OFFLINE" && (
              <>
                {logic.routeCoords.length > 0 && (
                  <Marker
                    coordinate={logic.routeCoords[0]}
                    title="Coleta"
                    pinColor="orange"
                  />
                )}
                {logic.routeCoords.length > 0 && (
                  <Marker
                    coordinate={logic.routeCoords[logic.routeCoords.length - 1]}
                    title="Entrega"
                    pinColor="green"
                  />
                )}
              </>
            )}
        </MapView>

        {/* --- HEADER SUPERIOR (Status e Instruções) --- */}
        <StatusHeader
          appMode={logic.appMode}
          isOnline={logic.isOnline}
          errorMsg={logic.errorMsg}
          navInstruction={logic.navInstruction}
          onToggleOnline={logic.handleToggleOnline}
          onRecenter={logic.recenterMap}
        />

        {/* --- BOTÕES FLUTUANTES --- */}

        {/* Botão de Simulação (Apenas para testes, aparece quando online e sem card expandido) */}
        {logic.appMode === "IDLE_ONLINE" && !logic.isSummaryExpanded && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={logic.simulateReceiveSolicitation}
          >
            <Ionicons
              name="paper-plane"
              size={moderateScale(24)}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}

        {/* Botão de Recentrar GPS (Útil quando o utilizador arrasta o mapa para longe) */}
        {(logic.appMode === "IDLE_ONLINE" || logic.appMode === "OFFLINE") && (
          <TouchableOpacity
            style={styles.recenterGpsButton}
            onPress={logic.recenterMap}
          >
            <Ionicons
              name="navigate"
              size={moderateScale(24)}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* --- CARDS INFERIORES (Camada acima do mapa) --- */}
      <View style={styles.bottomContainer}>
        {/* 1. Resumo de Ganhos (Aparece Offline ou Online Ocioso) */}
        {(logic.appMode === "OFFLINE" || logic.appMode === "IDLE_ONLINE") && (
          <SummaryCard
            isExpanded={logic.isSummaryExpanded}
            toggleExpansion={logic.toggleSummaryExpansion}
          />
        )}

        {/* 2. Card de Nova Solicitação (Toca o timer) */}
        {logic.appMode === "SOLICITATION" && logic.solicitation && (
          <SolicitationCard
            timer={logic.timer}
            solicitation={logic.solicitation}
            onAccept={logic.handleAcceptSolicitation}
            onReject={logic.handleRejectSolicitation}
          />
        )}

        {/* 3. Ações da Corrida (Cheguei, Entreguei, Cancelar) */}
        {(logic.appMode === "EN_ROUTE_PICKUP" ||
          logic.appMode === "EN_ROUTE_DELIVERY" ||
          logic.appMode === "DELIVERY_FINISHED" ||
          logic.navInstruction === "Entregar o pedido") && (
          <DeliveryActions
            appMode={logic.appMode}
            navInstruction={logic.navInstruction}
            onArrivedPickup={logic.handleArrivedPickup}
            onArrivedDelivery={logic.handleArrivedDelivery} // Lógica mockada no hook, podes implementar real depois
            onFinish={logic.handleFinishDelivery}
            onCancel={logic.handleCancelDelivery}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

// --- Estilos Locais de Posicionamento ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.textMuted,
  },
  bottomContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + verticalScale(5),
    left: horizontalScale(10),
    right: horizontalScale(10),
    // Garante que os cards fiquem acima do mapa
    zIndex: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + verticalScale(100) + SPACING.medium,
    right: horizontalScale(20),
    backgroundColor: COLORS.primary,
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  recenterGpsButton: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + verticalScale(100) + SPACING.medium,
    left: horizontalScale(20),
    backgroundColor: COLORS.white,
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(25),
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
