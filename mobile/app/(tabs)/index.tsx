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

// --- Imports de Lógica (Cérebro) e Estilos ---
import { useHomeLogic } from "../../hooks/useHomeLogic";
import {
  COLORS,
  moderateScale,
  verticalScale,
  horizontalScale,
  SPACING,
} from "../../constants/homeStyles";

// --- Imports dos Componentes Visuais (Corpo) ---
import { StatusHeader } from "../../components/Home/StatusHeader";
import { SummaryCard } from "../../components/Home/SummaryCard";
import { SolicitationCard } from "../../components/Home/SolicitationCard";
import { DeliveryActions } from "../../components/Home/DeliveryActions";

// Altura estimada da TabBar para cálculos de padding do mapa (garante que o logo do Google não fica escondido)
const TAB_BAR_HEIGHT = verticalScale(80);

const HomeScreen: React.FC = () => {
  // 1. Instanciamos o Hook.
  // Toda a lógica de GPS, Socket, Status Online e Regras de Negócio vem daqui.
  const logic = useHomeLogic();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* A barra de status muda de cor conforme o estado (Verde Online / Vermelho Offline) */}
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
          // Padding: Topo para o Header, Base para os Cards
          mapPadding={{
            top: verticalScale(100),
            right: 0,
            bottom: verticalScale(100 + TAB_BAR_HEIGHT),
            left: 0,
          }}
        >
          {/* Linha da Rota (Apenas desenha se houver coordenadas) */}
          {logic.routeCoords.length > 0 && (
            <Polyline
              coordinates={logic.routeCoords}
              strokeColor={COLORS.mapBlue}
              strokeWidth={4}
            />
          )}

          {/* Marcadores de Coleta e Entrega (Apenas em modos ativos) */}
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

        {/* --- COMPONENTE 1: HEADER SUPERIOR --- */}
        {/* Mostra Status (Online/Offline) ou Instruções de Navegação */}
        <StatusHeader
          appMode={logic.appMode}
          isOnline={logic.isOnline}
          errorMsg={logic.errorMsg}
          navInstruction={logic.navInstruction}
          onToggleOnline={logic.handleToggleOnline}
          onRecenter={logic.recenterMap}
        />

        {/* --- BOTÕES FLUTUANTES --- */}

        {/* Botão de Simulação (Apenas para testes, aparece quando online e ocioso) */}
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

        {/* Botão de Recentrar GPS (Útil se o usuário arrastar o mapa para longe) */}
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

      {/* --- ÁREA INFERIOR (CARDS) --- */}
      {/* Os cards sobrepõem o mapa na parte inferior */}
      <View style={styles.bottomContainer}>
        {/* COMPONENTE 2: RESUMO (Ganhos) */}
        {(logic.appMode === "OFFLINE" || logic.appMode === "IDLE_ONLINE") && (
          <SummaryCard
            isExpanded={logic.isSummaryExpanded}
            toggleExpansion={logic.toggleSummaryExpansion}
          />
        )}

        {/* COMPONENTE 3: SOLICITAÇÃO (Novo Pedido) */}
        {logic.appMode === "SOLICITATION" && logic.solicitation && (
          <SolicitationCard
            timer={logic.timer}
            solicitation={logic.solicitation}
            onAccept={logic.handleAcceptSolicitation}
            onReject={logic.handleRejectSolicitation}
          />
        )}

        {/* COMPONENTE 4: AÇÕES DA CORRIDA (Cheguei, Entreguei, etc.) */}
        {(logic.appMode === "EN_ROUTE_PICKUP" ||
          logic.appMode === "EN_ROUTE_DELIVERY" ||
          logic.appMode === "DELIVERY_FINISHED" ||
          logic.navInstruction === "Entregar o pedido") && (
          <DeliveryActions
            appMode={logic.appMode}
            navInstruction={logic.navInstruction}
            onArrivedPickup={logic.handleArrivedPickup}
            // Nota: Se quiseres implementar o botão "Cheguei no Cliente" separado, adiciona a função no hook
            onArrivedDelivery={() =>
              logic.setNavInstruction("Entregar o pedido")
            }
            onFinish={logic.handleFinishDelivery}
            onCancel={logic.handleCancelDelivery}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

// --- ESTILOS DE LAYOUT (Apenas posicionamento) ---
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
    zIndex: 10, // Garante que fica acima do mapa
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
