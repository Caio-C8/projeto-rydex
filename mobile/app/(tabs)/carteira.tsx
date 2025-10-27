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

// Você pode querer buscar esse saldo de algum lugar no futuro
const SALDO_ACUMULADO = 120.0;
const VALOR_MINIMO_SAQUE = 20.0;

export default function CarteiraScreen() {
  const [valorSaque, setValorSaque] = useState("");

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
      Alert.alert(
        "Valor Mínimo",
        `O valor mínimo para saque é de ${formatCurrency(VALOR_MINIMO_SAQUE)}.`
      );
      return;
    }

    // Validação 3: Tem saldo suficiente? (Opcional, mas bom ter)
    if (valorNumerico > SALDO_ACUMULADO) {
      Alert.alert(
        "Saldo Insuficiente",
        "Você não tem saldo suficiente para realizar este saque."
      );
      return;
    }

    // Se passou por todas as validações:
    console.log("Solicitando saque de:", formatCurrency(valorNumerico));
    Alert.alert(
      "Saque Solicitado!",
      `Seu saque de ${formatCurrency(
        valorNumerico
      )} foi solicitado com sucesso.`
    );
    // Aqui você chamaria a função real para processar o saque
    setValorSaque(""); // Limpa o campo após o saque
  };

  return (
    // SafeAreaView garante que o conteúdo não fique sob a barra de status/notch
    <SafeAreaView style={styles.safeArea}>
      {/* ScrollView permite rolar se o conteúdo for maior que a tela */}
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* O "card" branco principal */}
        <View style={styles.card}>
          <Text style={styles.title}>Sacar Saldo</Text>
          <Text style={styles.saldoLabel}>Saldo Acumulado</Text>
          <Text style={styles.saldoValor}>
            {formatCurrency(SALDO_ACUMULADO)}
          </Text>

          <Text style={styles.inputLabel}>Valor para saque</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Preencha o valor"
            placeholderTextColor="#9CA3AF" // Cinza claro para placeholder
            keyboardType="numeric" // Teclado numérico
            value={valorSaque}
            onChangeText={setValorSaque} // Atualiza o estado a cada dígito
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
    flexGrow: 1, // Permite que o ScrollView cresça
    padding: 16, // Espaçamento geral da tela
    justifyContent: "center", // Centraliza o card verticalmente (se houver espaço)
  },
  card: {
    width: "100%",
    maxWidth: 450, // Limita a largura em telas maiores
    alignSelf: "center", // Centraliza o card horizontalmente
    backgroundColor: "#FFFFFF", // Fundo branco do card
    padding: 24, // Espaçamento interno do card
    borderRadius: 30, // Cantos bem arredondados
    alignItems: "center", // Centraliza o conteúdo dentro do card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Sombra para Android
  },
  title: {
    fontSize: 28, // Tamanho grande
    fontWeight: "bold",
    color: "#FF5722", // Laranja Rydex
    marginBottom: 16,
  },
  saldoLabel: {
    fontSize: 16,
    color: "#FF5722", // Laranja Rydex
    marginBottom: 4,
  },
  saldoValor: {
    fontSize: 32, // Tamanho bem grande
    fontWeight: "bold",
    color: "#FF5722", // Laranja Rydex
    marginBottom: 32, // Mais espaço abaixo do saldo
  },
  inputLabel: {
    fontSize: 16,
    color: "#6B7280", // Cinza médio
    marginBottom: 8,
    alignSelf: "flex-start", // Alinha o label à esquerda
    marginLeft: 4, // Pequeno ajuste para alinhar com o input
  },
  textInput: {
    width: "100%", // Ocupa toda a largura do card
    padding: 14, // Padding interno
    borderWidth: 1,
    borderColor: "#D1D5DB", // Borda cinza clara
    borderRadius: 12, // Cantos arredondados
    fontSize: 16,
    color: "#2C2C2C", // Cinza escuro Rydex
    marginBottom: 24, // Espaço abaixo do input
    textAlign: "left", // Garante que o texto comece na esquerda
  },
  button: {
    width: "100%",
    paddingVertical: 14, // Padding vertical
    backgroundColor: "#FF5722", // Laranja Rydex
    borderRadius: 12, // Cantos arredondados
    marginBottom: 24, // Espaço abaixo do botão
  },
  buttonText: {
    color: "#FFFFFF", // Texto branco (diferente do login!)
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280", // Cinza médio
    textAlign: "center", // Texto centralizado
    lineHeight: 20, // Espaçamento entre linhas
  },
});
