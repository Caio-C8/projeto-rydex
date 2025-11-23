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
  useColorScheme,
  ActivityIndicator, // Importado para loading
} from "react-native";
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon } from "../components/Icons";

// Imports de Serviço e Utils
import {
  Colors,
  FontSizes,
  Fonts,
  verticalScale,
  horizontalScale,
} from "../constants/theme";
import { entregadoresService } from "../services/entregadores.service";
import { tratarErroApi } from "../utils/api-error-handler";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  const handleSubmit = async () => {
    // 1. Validações Locais
    if (!email || !password || !confirmPassword) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem. Tente novamente.");
      return;
    }

    // 2. Inicia Loading
    setIsLoading(true);

    try {
      // 3. Chama o Serviço
      // O backend espera: { email, nova_senha, confirmar_senha }
      await entregadoresService.redefinirSenha({
        email: email,
        nova_senha: password,
        confirmar_senha: confirmPassword,
      });

      // 4. Sucesso
      Alert.alert(
        "Sucesso!",
        "Sua senha foi trocada com sucesso. Faça login com a nova senha.",
        [{ text: "Ir para Login", onPress: () => router.push("/login") }]
      );
    } catch (error) {
      // 5. Erro (Email não encontrado, senhas fracas, etc)
      const msg = tratarErroApi(error);
      Alert.alert("Não foi possível trocar a senha", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}
    >
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LogoHeader
          mainHeading="Troque sua senha"
          subHeading="E faça o login novamente"
        />

        <View
          style={[
            styles.formContainer,
            { backgroundColor: themeColors.background },
          ]}
        >
          {/* Campo de E-mail */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              E-mail:
            </Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={[
                styles.textInput,
                {
                  borderColor: themeColors.lightGray,
                  color: themeColors.text,
                },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={themeColors.textGray}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading} // Bloqueia edição no loading
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              Nova Senha:
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: themeColors.lightGray },
              ]}
            >
              <TextInput
                placeholder="Nova senha"
                style={[
                  styles.textInputInsideWrapper,
                  { color: themeColors.text },
                ]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
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
            <Text style={[styles.label, { color: themeColors.text }]}>
              Confirmar Senha:
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: themeColors.lightGray },
              ]}
            >
              <TextInput
                placeholder="Confirmar nova senha"
                style={[
                  styles.textInputInsideWrapper,
                  { color: themeColors.text },
                ]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
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
            style={[
              styles.button,
              {
                backgroundColor: themeColors.rydexOrange,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={themeColors.textMuted} />
            ) : (
              <Text
                style={[styles.buttonText, { color: themeColors.textMuted }]}
              >
                TROCAR SENHA
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text
                  style={[
                    styles.linkOrange,
                    { color: themeColors.rydexOrange },
                  ]}
                >
                  Voltar para o login
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (Mantidos iguais aos anteriores)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    padding: horizontalScale(24),
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mb4: {
    marginBottom: verticalScale(24),
  },
  label: {
    fontSize: FontSizes.caption,
    fontWeight: "500",
    marginBottom: verticalScale(8),
    fontFamily: Fonts.sans,
  },
  textInput: {
    padding: verticalScale(12),
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
  },
  textInputInsideWrapper: {
    flex: 1,
    padding: verticalScale(12),
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
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
    height: verticalScale(50),
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  linksContainer: {
    alignItems: "center",
    marginTop: verticalScale(24),
  },
  linkOrange: {
    fontSize: FontSizes.caption,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
});
