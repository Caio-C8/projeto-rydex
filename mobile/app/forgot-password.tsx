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
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon } from "../components/Icons";

// 2. Importado do seu novo theme.ts
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem. Tente novamente.");
      return;
    }

    console.log("Trocando senha para:", { email, password });
    Alert.alert(
      "Sucesso!",
      "Sua senha foi trocada. Você será redirecionado para o login.",
      [{ text: "OK", onPress: () => router.push("/login") }]
    );
  };

  return (
    // 4. Cor de fundo dinâmica aplicada
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LogoHeader
          mainHeading="Troque sua senha"
          subHeading="E faça o login novamente"
        />

        {/* 5. Cor de fundo do card dinâmica */}
        <View style={[styles.formContainer, { backgroundColor: themeColors.background }]}>
          
          {/* Campo de E-mail */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={[
                styles.textInput,
                { 
                  borderColor: themeColors.lightGray, 
                  color: themeColors.text 
                }
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={themeColors.textGray}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Senha:</Text>
            <View style={[
              styles.inputWrapper, 
              { borderColor: themeColors.lightGray }
            ]}>
              <TextInput
                placeholder="Sua senha"
                style={[styles.textInputInsideWrapper, { color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo Confirmar Senha */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Confirmar Senha:</Text>
            <View style={[
              styles.inputWrapper,
              { borderColor: themeColors.lightGray }
            ]}>
              <TextInput
                placeholder="Confirmar senha"
                style={[styles.textInputInsideWrapper, { color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.rydexOrange }]} 
            onPress={handleSubmit}
          >
            {/* O Figma usa texto preto, que definimos como 'textMuted' no tema */}
            <Text style={[styles.buttonText, { color: themeColors.textMuted }]}>TROCAR SENHA</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkOrange, { color: themeColors.rydexOrange }]}>Voltar para o login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
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
  cardContainer: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    alignItems: "center",
    padding: horizontalScale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  formContainer: {
    width: "100%",
    // cor de fundo aplicada dinamicamente no JSX
    padding: horizontalScale(24),
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mb4: {
    marginBottom: verticalScale(24), // Usa escala (padronizado com login)
  },
  label: {
    fontSize: FontSizes.caption, // Usa FontSizes
    fontWeight: "500",
    marginBottom: verticalScale(8), // Usa escala
    fontFamily: Fonts.default.sans, // Usa Fonts
  },
  // Estilo para o campo de E-mail (sem ícone)
  textInput: {
    padding: verticalScale(12),
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
    fontSize: FontSizes.body, // Usa FontSizes
    fontFamily: Fonts.default.sans,
    // cores aplicadas dinamicamente no JSX
  },
  // "Caixa" para campos com ícone
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
  },
  // Campo de texto dentro da "caixa"
  textInputInsideWrapper: {
    flex: 1,
    padding: verticalScale(12),
    fontSize: FontSizes.body,
    fontFamily: Fonts.default.sans,
    paddingRight: horizontalScale(40),
  },
  eyeIcon: {
    position: "absolute",
    right: horizontalScale(12),
    opacity: 0.6,
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(12),
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSizes.body,
    fontFamily: Fonts.default.sans,
  },
  linksContainer: {
    alignItems: "center",
    marginTop: verticalScale(24),
  },
  linkOrange: {
    fontSize: FontSizes.caption,
    fontWeight: "700",
    fontFamily: Fonts.default.sans,
  },
});