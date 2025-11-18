import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme, // 1. Importado
} from "react-native";
import { router } from "expo-router";
import { ErrorIcon } from "../components/Icons"; 

// 2. Importado do seu novo theme.ts
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';

export default function SaqueErroScreen() {
  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleVoltar = () => {
    router.back();
  };

  return (
    // 4. Cor de fundo dinâmica aplicada
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <View style={styles.container}>
        {/* 5. Cor de fundo do card dinâmica */}
        <View style={[styles.card, { backgroundColor: themeColors.background }]}>
          <ErrorIcon />

          {/* 6. Cores e fontes dinâmicas */}
          <Text style={[styles.title, { color: themeColors.rydexOrange }]}>
            Erro na transferência
          </Text>

          <Text style={[styles.subText, { color: themeColors.textGray }]}>
            Erro ao processar a transferência. Tente novamente mais tarde
          </Text>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.rydexOrange }]} 
            onPress={handleVoltar}
          >
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
    textAlign: "center",
    fontFamily: Fonts.sans,
  },
  subText: {
    fontSize: FontSizes.body, // Usa FontSizes
    textAlign: "center",
    lineHeight: verticalScale(24),
    marginBottom: verticalScale(32),
    fontFamily: Fonts.sans,
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
    fontFamily: Fonts.sans,
  },
});