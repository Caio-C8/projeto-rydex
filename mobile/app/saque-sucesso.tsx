import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme, // 1. Importado
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DoubleCheckIcon } from "../components/Icons"; 

// 2. Importado do seu novo theme.ts
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';

export default function SaqueSucessoScreen() {
  const params = useLocalSearchParams();
  const valor = parseFloat(params.valor as string);

  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const formatCurrency = (value: number) => {
    if (isNaN(value)) {
      return "R$ 0,00"; 
    }
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    // 4. Cor de fundo dinâmica aplicada
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <View style={styles.container}>
        {/* 5. Cor de fundo do card dinâmica */}
        <View style={[styles.card, { backgroundColor: themeColors.background }]}>
          <DoubleCheckIcon />

          {/* 6. Cores e fontes dinâmicas */}
          <Text style={[styles.title, { color: themeColors.rydexOrange }]}>
            Pix enviado com sucesso!
          </Text>

          <Text style={[styles.subText, { color: themeColors.textGray }]}>
            Seu saldo de {formatCurrency(valor)} foi transferido para a chave
            pix cadastrada.
          </Text>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.rydexOrange }]} 
            onPress={handleVoltar}
          >
            {/* O Figma usa texto branco, que definimos como 'white' no tema */}
            <Text style={[styles.buttonText, { color: themeColors.white }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (ATUALIZADOS COM ESCALA RESPONSIVA)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // cor de fundo aplicada dinamicamente no JSX
  },
  container: {
    flex: 1,
    padding: horizontalScale(16),
    justifyContent: "center", 
    alignItems: "center", 
  },
  card: {
    width: "100%",
    maxWidth: 450,
    // cor de fundo aplicada dinamicamente no JSX
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(48),
    borderRadius: 30,
    alignItems: "center", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: FontSizes.subtitle, // Usa FontSizes
    fontWeight: "bold",
    marginTop: verticalScale(24), 
    marginBottom: verticalScale(16),
    fontFamily: Fonts.default.sans,
  },
  subText: {
    fontSize: FontSizes.body, // Usa FontSizes
    textAlign: "center",
    lineHeight: verticalScale(24), 
    marginBottom: verticalScale(32),
    fontFamily: Fonts.default.sans,
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(14),
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSizes.body, // Usa FontSizes
    fontFamily: Fonts.default.sans,
  },
});