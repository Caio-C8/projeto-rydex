import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDERS,
  verticalScale,
} from "../constants/home-styles";
import { AppMode } from "../hooks/use-home-logic";

interface DeliveryActionsProps {
  appMode: AppMode;
  navInstruction: string;
  onArrivedPickup: () => void;
  onArrivedDelivery: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

export const DeliveryActions: React.FC<DeliveryActionsProps> = ({
  appMode,
  navInstruction,
  onArrivedPickup,
  onArrivedDelivery,
  onFinish,
  onCancel,
}) => {
  let button1 = null;
  let button2 = null;

  if (appMode === "EN_ROUTE_PICKUP") {
    button1 = (
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={onArrivedPickup}
      >
        <Text style={styles.actionButtonText}>CHEGUEI NA EMPRESA</Text>
      </TouchableOpacity>
    );
    button2 = (
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={onCancel}
      >
        <Text style={styles.cancelButtonText}>CANCELAR</Text>
      </TouchableOpacity>
    );
  } else if (appMode === "EN_ROUTE_DELIVERY") {
    button1 = (
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={onArrivedDelivery}
      >
        <Text style={styles.actionButtonText}>CHEGUEI NO LOCAL</Text>
      </TouchableOpacity>
    );
    button2 = (
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={onCancel}
      >
        <Text style={styles.cancelButtonText}>CANCELAR</Text>
      </TouchableOpacity>
    );
  } else if (navInstruction === "Entregar o pedido") {
    button1 = (
      <TouchableOpacity
        style={[styles.actionButton, styles.finishButton]}
        onPress={onFinish}
      >
        <Text style={styles.actionButtonText}>ENTREGA FINALIZADA</Text>
      </TouchableOpacity>
    );
  } else if (appMode === "DELIVERY_FINISHED") {
    button1 = <Text style={styles.finishedText}>ENTREGA FINALIZADA</Text>;
  }

  return (
    <View style={[styles.bottomCardBase, styles.deliveryActionsContainer]}>
      {button1}
      {button2}
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
  deliveryActionsContainer: { flexDirection: "column", gap: SPACING.medium },
  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: BORDERS.radiusSmall,
    alignItems: "center",
  },
  primaryButton: { backgroundColor: COLORS.success },
  cancelButton: { backgroundColor: COLORS.border },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZES.medium,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "bold",
    fontSize: FONT_SIZES.medium,
  },
  finishButton: { backgroundColor: COLORS.primary },
  finishedText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
});
