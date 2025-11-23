import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDERS,
  verticalScale,
  moderateScale,
  horizontalScale,
} from "../../constants/homeStyles";
import { AppMode } from "../../hooks/useHomeLogic";

interface StatusHeaderProps {
  appMode: AppMode;
  isOnline: boolean;
  errorMsg: string | null;
  navInstruction: string;
  onToggleOnline: () => void;
  onRecenter: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  appMode,
  isOnline,
  errorMsg,
  navInstruction,
  onToggleOnline,
  onRecenter,
}) => {
  // Caso de Erro (GPS desligado, sem permissão, etc)
  if (errorMsg) {
    return (
      <View style={[styles.topStatusContainer, styles.offlineBg]}>
        <Ionicons
          name="warning-outline"
          size={moderateScale(24)}
          color={COLORS.danger}
          style={{ marginRight: SPACING.medium }}
        />
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  // Modo Navegação (Em rota de coleta ou entrega)
  if (appMode === "EN_ROUTE_PICKUP" || appMode === "EN_ROUTE_DELIVERY") {
    return (
      <View style={styles.navInstructionContainer}>
        <Ionicons
          name="navigate-circle-outline"
          size={moderateScale(20)}
          color={COLORS.white}
          style={{ marginRight: SPACING.small }}
        />
        <Text style={styles.navInstructionText} numberOfLines={1}>
          {navInstruction || "Calculando rota..."}
        </Text>
        <TouchableOpacity style={styles.recenterButton} onPress={onRecenter}>
          <Ionicons
            name="locate-outline"
            size={moderateScale(24)}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Modo Padrão (Online/Offline/Ocioso)
  if (
    appMode === "OFFLINE" ||
    appMode === "IDLE_ONLINE" ||
    appMode === "SOLICITATION" ||
    appMode === "DELIVERY_FINISHED"
  ) {
    const isOnlineMode = isOnline; // Baseado na prop real
    return (
      <View
        style={[
          styles.topStatusContainer,
          isOnlineMode ? styles.onlineBg : styles.offlineBg,
        ]}
      >
        <View
          style={[
            styles.profileIconCircle,
            { borderColor: isOnlineMode ? COLORS.online : COLORS.offline },
          ]}
        >
          <Ionicons
            name="person"
            size={moderateScale(24)}
            color={isOnlineMode ? COLORS.online : COLORS.offline}
          />
        </View>
        <View style={styles.statusTextContainer}>
          <Text
            style={[
              styles.statusTitle,
              { color: isOnlineMode ? COLORS.online : COLORS.offline },
            ]}
          >
            {isOnlineMode ? "Online" : "Offline"}
          </Text>
          <Text style={styles.statusSubtitle} numberOfLines={2}>
            {isOnlineMode
              ? "Solicitações chegarão a qualquer momento"
              : "Fique ONLINE para receber solicitações"}
          </Text>
        </View>
        <Switch
          trackColor={{ false: COLORS.border, true: COLORS.online }}
          thumbColor={COLORS.white}
          ios_backgroundColor={COLORS.border}
          onValueChange={onToggleOnline}
          value={isOnline}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  topStatusContainer: {
    position: "absolute",
    top:
      Platform.OS === "android"
        ? (StatusBar.currentHeight || 24) + verticalScale(10)
        : verticalScale(50),
    left: horizontalScale(15),
    right: horizontalScale(15),
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.medium,
    borderRadius: BORDERS.radiusMedium,
    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  onlineBg: { backgroundColor: COLORS.white },
  offlineBg: { backgroundColor: "#ffebee" },
  profileIconCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
    borderWidth: 2,
  },
  statusTextContainer: { flex: 1, marginRight: SPACING.small },
  statusTitle: { fontSize: FONT_SIZES.large, fontWeight: "bold" },
  statusSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    flexWrap: "wrap",
    marginTop: SPACING.xsmall,
  },
  errorText: { color: COLORS.danger, fontSize: FONT_SIZES.small, flex: 1 },
  navInstructionContainer: {
    position: "absolute",
    top:
      Platform.OS === "android"
        ? (StatusBar.currentHeight || 24) + verticalScale(10)
        : verticalScale(50),
    left: horizontalScale(15),
    right: horizontalScale(15),
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: BORDERS.radiusSmall,
    flexDirection: "row",
    alignItems: "center",
  },
  navInstructionText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    flex: 1,
    marginRight: SPACING.small,
  },
  recenterButton: {
    padding: SPACING.xsmall,
    backgroundColor: COLORS.white,
    borderRadius: 50,
  },
});
