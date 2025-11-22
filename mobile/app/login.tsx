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
import { Link, router } from "expo-router"; // Adicionei 'router' para o futuro
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
// 2. Importado do seu novo theme.ts
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';

import api from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleSubmit = async () => {
    if (!email || !password) {
      return Alert.alert("Atenção", "Por favor, preencha e-mail e senha.");
    }

    setLoading(true); // Bloqueia novos cliques

    try {
      // 5. Chamada ao Backend
      // ATENÇÃO: Verifique se a rota no seu backend é '/sessions', '/login' ou '/auth'
      const response = await api.post('/login', { 
        email: email, 
        password: password 
      });

      // 6. Salvar o Token (Essencial para manter logado)
      // Supondo que o backend retorna { token: "...", user: { ... } }
      const { token, user } = response.data;
      
      if (token) {
        await AsyncStorage.setItem('@token', token);
      }

      // Opcional: Salvar dados do usuário se precisar exibir nome/foto depois
      // await AsyncStorage.setItem('@user', JSON.stringify(user));

      Alert.alert("Sucesso", `Bem-vindo, ${user?.name || 'Entregador'}!`);
      
      // 7. Navega para a área logada
      router.replace('/(tabs)/'); 

    } catch (error: any) {
      console.log("Erro no login:", error);
      
      // Tratamento básico de erro
      if (error.response) {
         Alert.alert("Erro", error.response.data.message || "E-mail ou senha inválidos.");
      } else {
         Alert.alert("Erro de Conexão", "Verifique se o backend está rodando e o IP está correto.");
      }
    } finally {
      setLoading(false); // Libera o botão
    }
  };

  return (
    // 4. Cor de fundo dinâmica aplicada
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LogoHeader
          mainHeading="Bem-vindo de volta entregador(a)!"
          subHeading="Entre para começar a fazer entregas"
        />

        {/* 5. Cor de fundo do card dinâmica */}
        <View style={[styles.formContainer, { backgroundColor: themeColors.background }]}>
          
          <View style={styles.mb4}>
            {/* 6. Cor do texto dinâmica */}
            <Text style={[styles.label, { color: themeColors.text }]}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={[
                styles.textInput, // Estilo base
                { 
                  borderColor: themeColors.lightGray, // Cor dinâmica
                  color: themeColors.text // Cor dinâmica
                }
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={themeColors.textGray} // Cor dinâmica
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Senha:</Text>
            {/* 7. Cor da borda dinâmica */}
            <View style={[
              styles.inputWrapper,
              { borderColor: themeColors.lightGray }
            ]}>
              <TextInput
                placeholder="Sua senha"
                style={[styles.textInputInsideWrapper, { color: themeColors.text }]} // Cor dinâmica
                placeholderTextColor={themeColors.textGray} // Cor dinâmica
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {/* A cor do ícone (stroke) deve ser ajustada em Icons.tsx ou passada como prop */}
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
          </View>

          {/* 8. Cor do botão e do texto dinâmicas */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.rydexOrange }]} 
            onPress={handleSubmit}
          >
            <Text style={[styles.buttonText, { color: themeColors.rydexGray }]}>ENTRAR</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity style={styles.mb2}>
                <Text style={[styles.linkOrange, { color: themeColors.rydexOrange }]}>Esqueci a senha</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/register" asChild>
              <TouchableOpacity>
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
// ESTILOS (AGORA USANDO FONTSIZES E SCALES)
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
    marginBottom: verticalScale(24), // Usa escala
  },
  label: {
    fontSize: FontSizes.caption, // Usa FontSizes
    fontWeight: "500",
    marginBottom: verticalScale(8), // Usa escala
    fontFamily: Fonts.sans, // Usa Fonts
  },
  // Este estilo é usado apenas pelo campo de E-mail
  textInput: {
    padding: verticalScale(12),
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
    fontSize: FontSizes.body, // Usa FontSizes
    fontFamily: Fonts.sans,
    // cores aplicadas dinamicamente no JSX
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
    fontSize: FontSizes.body, // Usa FontSizes
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
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSizes.body, // Usa FontSizes
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
    fontSize: FontSizes.caption, // Usa FontSizes
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  linkGray: {
    fontSize: FontSizes.caption, // Usa FontSizes
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
});