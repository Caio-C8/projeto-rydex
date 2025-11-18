import { router } from "expo-router"; 
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
  useColorScheme, // 1. Importado
} from "react-native";

// 2. Importado do seu novo theme.ts (subindo dois níveis: ../../)
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../../constants/theme';

// Valor inicial do saldo, pode vir de outro lugar no futuro
const SALDO_INICIAL = 120.0;
const VALOR_MINIMO_SAQUE = 20.0;

export default function CarteiraScreen() {
  const [valorSaque, setValorSaque] = useState("");
  const [saldoAtual, setSaldoAtual] = useState(SALDO_INICIAL);

  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Função para formatar o saldo como moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para lidar com o saque
  const handleSaque = () => {
    const valorNumerico = parseFloat(valorSaque.replace(",", "."));

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert(
        "Valor Inválido",
        "Por favor, digite um valor numérico válido para o saque."
      );
      return;
    }

    if (valorNumerico < VALOR_MINIMO_SAQUE) {
      router.push("/saque-erro");
      return;
    }

    if (valorNumerico > saldoAtual) {
      Alert.alert(
        "Saldo Insuficiente",
        "Você não tem saldo suficiente para realizar este saque."
      );
      return;
    }

    console.log("Solicitando saque de:", formatCurrency(valorNumerico));

    const sistemaOffline = valorNumerico === 1; // Nosso erro simulado

    if (sistemaOffline) {
      router.push("/saque-erro");
    } else {
      const novoSaldo = saldoAtual - valorNumerico;
      setSaldoAtual(novoSaldo);
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
    // 4. Cor de fundo dinâmica aplicada
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* 5. Cor de fundo do card dinâmica */}
        <View style={[styles.card, { backgroundColor: themeColors.background }]}>
          {/* 6. Cores e fontes dinâmicas */}
          <Text style={[styles.title, { color: themeColors.rydexOrange }]}>Sacar Saldo</Text>
          <Text style={[styles.saldoLabel, { color: themeColors.rydexOrange }]}>Saldo Acumulado</Text>
          <Text style={[styles.saldoValor, { color: themeColors.rydexOrange }]}>
            {formatCurrency(saldoAtual)}
          </Text>

          <Text style={[styles.inputLabel, { color: themeColors.textGray }]}>Valor para saque</Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                borderColor: themeColors.lightGray, 
                color: themeColors.text 
              }
            ]}
            placeholder="Preencha o valor"
            placeholderTextColor={themeColors.textGray} // Cor dinâmica
            keyboardType="numeric"
            value={valorSaque}
            onChangeText={setValorSaque}
          />

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.rydexOrange }]} 
            onPress={handleSaque}
          >
            <Text style={[styles.buttonText, { color: themeColors.white }]}>Sacar</Text>
          </TouchableOpacity>

          <Text style={[styles.infoText, { color: themeColors.textGray }]}>
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
// ESTILOS (ATUALIZADOS COM ESCALA RESPONSIVA)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // cor de fundo aplicada dinamicamente no JSX
  },
  container: {
    flexGrow: 1,
    padding: horizontalScale(16),
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    // cor de fundo aplicada dinamicamente no JSX
    padding: horizontalScale(24),
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: FontSizes.titleLarge, // Usa FontSizes
    fontWeight: "bold",
    marginBottom: verticalScale(16),
    fontFamily: Fonts.sans,
  },
  saldoLabel: {
    fontSize: FontSizes.body, // Usa FontSizes
    marginBottom: verticalScale(4),
    fontFamily: Fonts.sans,
  },
  saldoValor: {
    fontSize: FontSizes.xlarge, // Usa FontSizes
    fontWeight: "bold",
    marginBottom: verticalScale(32),
    fontFamily: Fonts.sans,
  },
  inputLabel: {
    fontSize: FontSizes.body, // Usa FontSizes
    marginBottom: verticalScale(8),
    alignSelf: "flex-start",
    marginLeft: horizontalScale(4),
    fontFamily: Fonts.sans,
  },
  textInput: {
    width: "100%",
    padding: verticalScale(14),
    borderWidth: 1,
    borderRadius: 12,
    fontSize: FontSizes.body, // Usa FontSizes
    marginBottom: verticalScale(24),
    textAlign: "left",
    fontFamily: Fonts.sans,
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(14),
    borderRadius: 12,
    marginBottom: verticalScale(24),
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSizes.body, // Usa FontSizes
    fontFamily: Fonts.sans,
  },
  infoText: {
    fontSize: FontSizes.caption, // Usa FontSizes
    textAlign: "center",
    lineHeight: verticalScale(20),
    fontFamily: Fonts.sans,
  },
});