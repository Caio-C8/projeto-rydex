import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDERS,
  verticalScale,
  moderateScale,
} from "../../constants/homeStyles";

interface SolicitationCardProps {
  timer: number;
  solicitation: any;
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
      {/* Timer Flutuante */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timer}</Text>
        <Text style={styles.timerLabel}>s</Text>
      </View>

      <View style={styles.solicitationDetails}>
        {/* Cabeçalho: Nome da Loja e Valor */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.solicitationTitle}>
              {solicitation.storeName}
            </Text>
            <Text style={styles.distanceText}>
              Distância estimada: {solicitation.distanceLabel}
            </Text>
          </View>
          <Text style={styles.solicitationValue}>
            R$ {solicitation.value.toFixed(2).replace(".", ",")}
          </Text>
        </View>

        {/* Badge de Retorno */}
        {solicitation.hasReturn && (
          <View style={styles.returnBadge}>
            <Feather name="refresh-cw" size={12} color="#d35400" />
            <Text style={styles.returnText}>Itens para retorno</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Endereços */}
        <Text style={styles.detailLabel}>📍 RETIRADA</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {solicitation.pickupAddress}
        </Text>

        <Text style={[styles.detailLabel, { marginTop: 8 }]}>🏁 ENTREGA</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {solicitation.deliveryAddress}
        </Text>

        {/* Observações */}
        {solicitation.notes && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Obs:</Text>
            <Text style={styles.noteValue} numberOfLines={1}>
              {solicitation.notes}
            </Text>
          </View>
        )}
      </View>

      {/* Botões de Ação */}
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
  solicitationCard: { paddingBottom: SPACING.medium },
  timerContainer: {
    position: "absolute",
    top: -moderateScale(25),
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: SPACING.small,
    elevation: 11,
    minWidth: 60,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  solicitationTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  solicitationValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.success,
  },
  distanceText: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.medium,
  },

  detailLabel: {
    fontSize: FONT_SIZES.xsmall,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: SPACING.xsmall,
  },
  detailValue: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },

  returnBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdebd0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  returnText: {
    fontSize: FONT_SIZES.xsmall,
    color: "#d35400",
    fontWeight: "bold",
    marginLeft: 4,
  },

  noteContainer: {
    flexDirection: "row",
    marginTop: 8,
    backgroundColor: "#f8f9fa",
    padding: 6,
    borderRadius: 4,
  },
  noteLabel: {
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  noteValue: { fontSize: FONT_SIZES.small, color: COLORS.textPrimary, flex: 1 },

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
