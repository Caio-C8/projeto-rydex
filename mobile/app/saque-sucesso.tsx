import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DoubleCheckIcon } from "../components/Icons"; // Importa o novo ícone

export default function SaqueSucessoScreen() {
  // Pega os parâmetros enviados pela tela anterior
  const params = useLocalSearchParams();
  // Converte o valor (que vem como string) para número
  const valor = parseFloat(params.valor as string);

  // Função para formatar o valor como R$120,00
  const formatCurrency = (value: number) => {
    if (isNaN(value)) {
      return "R$ 0,00"; // Valor padrão em caso de erro
    }
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleVoltar = () => {
    // Volta para a tela anterior (a de Carteira)
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* O "card" branco principal */}
        <View style={styles.card}>
          <DoubleCheckIcon />

          <Text style={styles.title}>Pix enviado com sucesso!</Text>

          <Text style={styles.subText}>
            Seu saldo de {formatCurrency(valor)} foi transferido para a chave
            pix cadastrada.
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
// ESTILOS (Para ficar igual ao Figma)
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
    paddingHorizontal: 24, // Padding nos lados
    paddingVertical: 48, // Mais padding em cima/baixo
    borderRadius: 30,
    alignItems: "center", // Centraliza o conteúdo dentro do card
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
    marginTop: 24, // Espaço abaixo do ícone
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    color: "#6B7280", // Cinza médio
    textAlign: "center",
    lineHeight: 24, // Espaçamento entre linhas
    marginBottom: 32, // Mais espaço abaixo do texto
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
