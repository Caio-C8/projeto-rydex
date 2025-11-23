import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDERS,
  verticalScale,
  moderateScale,
} from "../constants/home-styles";

interface SolicitationCardProps {
  timer: number;
  solicitation: any; // Defina uma interface correta depois
  onAccept: () => void;
  onReject: () => void;
}

export const SolicitationCard: React.FC<SolicitationCardProps> = ({
  timer,
  solicitation,
  onAccept,
  onReject,
}) => {
  if (!solicitation) return null;

  return (
    <View style={[styles.bottomCardBase, styles.solicitationCard]}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timer}</Text>
        <Text style={styles.timerLabel}>segundos</Text>
      </View>
      <View style={styles.solicitationDetails}>
        <Text style={styles.solicitationTitle}>{solicitation.storeName}</Text>
        <Text style={styles.solicitationValue}>
          R$ {solicitation.value.toFixed(2).replace(".", ",")}
        </Text>

        <Text style={styles.detailLabel}>COLETA</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {solicitation.pickupAddress}
        </Text>

        <Text style={styles.detailLabel}>ENTREGA</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {solicitation.deliveryAddress}
        </Text>
      </View>
      <View style={styles.solicitationActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={onReject}
        >
          <Text style={styles.actionButtonText}>REJEITAR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={onAccept}
        >
          <Text style={styles.actionButtonText}>ACEITAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Copie APENAS os estilos relevantes para este card do arquivo original
  bottomCardBase: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radiusMedium,
    padding: SPACING.medium,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  solicitationCard: { paddingBottom: SPACING.xlarge },
  timerContainer: {
    position: "absolute",
    top: -moderateScale(25),
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: SPACING.small,
    elevation: 11,
  },
  timerText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.danger,
  },
  timerLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: -SPACING.xsmall,
  },
  solicitationDetails: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.large,
  },
  solicitationTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xsmall,
  },
  solicitationValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.success,
    marginBottom: SPACING.medium,
  },
  detailLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xsmall,
  },
  detailValue: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  solicitationActions: { flexDirection: "row", gap: SPACING.medium },
  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: BORDERS.radiusSmall,
    alignItems: "center",
  },
  acceptButton: { backgroundColor: COLORS.success },
  rejectButton: { backgroundColor: COLORS.danger },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZES.medium,
  },
});
