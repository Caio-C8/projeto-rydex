import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet, // <-- Importa o StyleSheet
  SafeAreaView,
} from "react-native";
import { Link } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon } from "../components/Icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    console.log("Login:", { email, password });
    Alert.alert("Login", "Login realizado com sucesso! (simulação)");
  };

  return (
    // SafeAreaView é melhor que ScrollView para telas de login
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LogoHeader
          mainHeading="Bem-vindo de volta entregador(a)!"
          subHeading="Entre para começar a fazer entregas"
        />

        <View style={styles.formContainer}>
          <View style={styles.mb4}>
            <Text style={styles.label}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={styles.textInput} // <-- Usa o estilo
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha:</Text>
            <TextInput
              placeholder="Sua senha"
              style={styles.textInput} // <-- Usa o estilo
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon} // <-- Usa o estilo
              onPress={() => setShowPassword(!showPassword)}
            >
              <EyeIcon />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity style={styles.mb2}>
                <Text style={styles.linkOrange}>Esqueci a senha</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.linkGray}>Não estou cadastrado</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===============================================
// AQUI ESTÃO OS ESTILOS (O CSS CONVERTIDO)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F0F0", // bg-light
  },
  container: {
    flex: 1,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center", // Centraliza o card
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 24, // p-6
    borderRadius: 12, // rounded-xl
    // Sombra (aproximação de shadow-lg)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mb4: {
    marginBottom: 16,
  },
  label: {
    color: "#2C2C2C", // text-rydex-gray
    fontSize: 14,
    fontWeight: "500", // font-medium
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB", // border-gray-300
    borderRadius: 8,
    width: "100%",
    fontSize: 16,
    color: "#2C2C2C",
  },
  inputGroup: {
    position: "relative",
    marginBottom: 24, // mb-6
  },
  eyeIcon: {
    position: "absolute",
    top: 45, // Ajuste manual
    right: 12,
    opacity: 0.6,
  },
  button: {
    width: "100%",
    paddingVertical: 12, // py-3
    backgroundColor: "#FF5722", // bg-rydex-orange
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF", // text-white
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  linksContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  mb2: {
    marginBottom: 8,
  },
  linkOrange: {
    color: "#FF5722", // text-rydex-orange
    fontSize: 14,
    fontWeight: "600",
  },
  linkGray: {
    color: "#2C2C2C", // text-rydex-gray
    fontSize: 14,
    fontWeight: "600",
  },
});
