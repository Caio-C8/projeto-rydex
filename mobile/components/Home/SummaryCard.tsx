import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDERS,
} from "../../constants/homeStyles";

interface SummaryCardProps {
  isExpanded: boolean;
  toggleExpansion: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  isExpanded,
  toggleExpansion,
}) => {
  return (
    <View style={[styles.bottomCardBase, styles.summaryCard]}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Seus ganhos</Text>
        <TouchableOpacity onPress={toggleExpansion}>
          <Text style={styles.viewMoreText}>
            {isExpanded ? "VER MENOS" : "VER MAIS"}
          </Text>
        </TouchableOpacity>
      </View>
      {isExpanded && (
        <>
          <Text style={styles.earningsText}>R$ 0,00</Text>
          <Text style={styles.earningsLabel}>Entregas do dia</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Aceitas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Finalizadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Recusadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Canceladas</Text>
            </View>
          </View>
        </>
      )}
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
  summaryCard: {},
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  viewMoreText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  earningsText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
    marginTop: SPACING.small,
    textAlign: "left",
  },
  earningsLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.large,
    textAlign: "left",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "flex-start",
    marginBottom: SPACING.medium,
  },
  statValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xsmall,
  },
  statLabel: {
    fontSize: FONT_SIZES.xsmall,
    color: COLORS.textSecondary,
    textAlign: "left",
  },
});
