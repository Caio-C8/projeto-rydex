import { router } from "expo-router"; // <-- Importe o router
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";

// Valor inicial do saldo, pode vir de outro lugar no futuro
const SALDO_INICIAL = 120.0;
const VALOR_MINIMO_SAQUE = 20.0;

export default function CarteiraScreen() {
  const [valorSaque, setValorSaque] = useState("");
  // ===================================
  // MUDANÇA 1: USAR useState PARA O SALDO
  // ===================================
  const [saldoAtual, setSaldoAtual] = useState(SALDO_INICIAL);
  // ===================================

  // Função para formatar o saldo como moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para lidar com o saque
  const handleSaque = () => {
    // Converte o valor digitado (que pode ter vírgula) para número
    const valorNumerico = parseFloat(valorSaque.replace(",", "."));

    // Validação 1: É um número válido?
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert(
        "Valor Inválido",
        "Por favor, digite um valor numérico válido para o saque."
      );
      return;
    }

    // Validação 2: É maior ou igual ao mínimo?
    if (valorNumerico < VALOR_MINIMO_SAQUE) {
      router.push("/saque-erro");
      return;
    }

    // Validação 3: Tem saldo suficiente?
    // Agora usamos 'saldoAtual' em vez de SALDO_ACUMULADO
    if (valorNumerico > saldoAtual) {
      Alert.alert(
        "Saldo Insuficiente",
        "Você não tem saldo suficiente para realizar este saque."
      );
      return;
    }

    // Se passou pelas validações iniciais:
    console.log("Solicitando saque de:", formatCurrency(valorNumerico));

    // Simulação de erro/sucesso
    const sistemaOffline = valorNumerico === 1; // Nosso erro simulado

    if (sistemaOffline) {
      router.push("/saque-erro");
    } else {
      // ===================================
      // MUDANÇA 2: ATUALIZAR O SALDO NO SUCESSO
      // ===================================
      // Calcula o novo saldo
      const novoSaldo = saldoAtual - valorNumerico;
      // Atualiza o estado do saldo
      setSaldoAtual(novoSaldo);
      // ===================================

      // Navega para a tela de sucesso
      router.push({
        pathname: "/saque-sucesso",
        params: { valor: valorNumerico },
      });
    }

    setValorSaque(""); // Limpa o campo
  }; // <-- FIM DA FUNÇÃO handleSaque

  // ===================================
  // O RETURN DA TELA COMEÇA AQUI
  // ===================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Sacar Saldo</Text>
          <Text style={styles.saldoLabel}>Saldo Acumulado</Text>
          <Text style={styles.saldoValor}>
            {/* Mostra o saldo DO ESTADO (que pode mudar) */}
            {formatCurrency(saldoAtual)}
          </Text>

          <Text style={styles.inputLabel}>Valor para saque</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Preencha o valor"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={valorSaque}
            onChangeText={setValorSaque}
          />

          <TouchableOpacity style={styles.button} onPress={handleSaque}>
            <Text style={styles.buttonText}>Sacar</Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            O saque pode ser feito apenas em um dia específico da semana e o
            valor mínimo é de R$20,00.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
  // ===================================
  // FIM DO RETURN DA TELA
  // ===================================
} // <-- FIM DA FUNÇÃO CarteiraScreen

// ===============================================
// ESTILOS (Permanecem iguais)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 16,
  },
  saldoLabel: {
    fontSize: 16,
    color: "#FF5722",
    marginBottom: 4,
  },
  saldoValor: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
    alignSelf: "flex-start",
    marginLeft: 4,
  },
  textInput: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    fontSize: 16,
    color: "#2C2C2C",
    marginBottom: 24,
    textAlign: "left",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#FF5722",
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
