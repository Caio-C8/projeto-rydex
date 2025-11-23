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
  ActivityIndicator, // Importado para o loading
} from "react-native";
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';

// Importações do Serviço e Utils
import { authService } from "../services/auth.service";
import { tratarErroApi } from "../utils/api-error-handler";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para controlar o loading do botão
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    // 1. Validação simples antes de chamar a API
    if (!email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    // 2. Inicia o loading
    setIsLoading(true);

    try {
      // 3. Chama o serviço (o token é salvo automaticamente dentro dele)
      await authService.login(email, password);

      // 4. Se não deu erro, navega para a área logada
      router.replace('/(tabs)/'); 
      
    } catch (error) {
      // 5. Usa nosso utilitário para formatar a mensagem de erro do NestJS
      const mensagemErro = tratarErroApi(error);
      Alert.alert("Falha no Login", mensagemErro);
    } finally {
      // 6. Para o loading independentemente do resultado
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LogoHeader
          mainHeading="Bem-vindo de volta entregador(a)!"
          subHeading="Entre para começar a fazer entregas"
        />

        <View style={[styles.formContainer, { backgroundColor: themeColors.background }]}>
          
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
              // Desabilita edição durante loading
              editable={!isLoading} 
            />
          </View>

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
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão com Loading */}
          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: themeColors.rydexOrange, opacity: isLoading ? 0.7 : 1 }
            ]} 
            onPress={handleLogin}
            disabled={isLoading} // Impede duplo clique
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={themeColors.rydexGray} />
            ) : (
              <Text style={[styles.buttonText, { color: themeColors.rydexGray }]}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity style={styles.mb2} disabled={isLoading}>
                <Text style={[styles.linkOrange, { color: themeColors.rydexOrange }]}>Esqueci a senha</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/register" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={[styles.linkGray, { color: themeColors.rydexGray }]}>Não estou cadastrado</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (Mantidos iguais aos originais)
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
    alignItems: 'center', // Garante que o indicador fique no centro
    justifyContent: 'center',
    height: verticalScale(48), // Altura fixa ajuda a não pular quando muda texto/loading
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
  mb2: {
    marginBottom: verticalScale(8),
  },
  linkOrange: {
    fontSize: FontSizes.caption,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  linkGray: {
    fontSize: FontSizes.caption,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
});