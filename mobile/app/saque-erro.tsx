import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { ErrorIcon } from "../components/Icons"; // Importa o novo ícone

export default function SaqueErroScreen() {
  const handleVoltar = () => {
    // Volta para a tela anterior (a de Carteira)
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* O "card" branco principal */}
        <View style={styles.card}>
          <ErrorIcon />

          <Text style={styles.title}>Erro na transferência</Text>

          <Text style={styles.subText}>
            Erro ao processar a transferência. Tente novamente mais tarde
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleVoltar}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (Quase idênticos ao saque-sucesso.tsx)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F0F0", // Fundo cinza claro da tela
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center", // Centraliza o card verticalmente
    alignItems: "center", // Centraliza o card horizontalmente
  },
  card: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 48,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF5722", // Laranja Rydex
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center", // Garante centralização
  },
  subText: {
    fontSize: 16,
    color: "#6B7280", // Cinza médio
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#FF5722",
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF", // Texto branco
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
