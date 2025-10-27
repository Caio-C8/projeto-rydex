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
import { Link, router } from "expo-router"; // Importamos o 'router'
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon } from "../components/Icons"; // Correto

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = () => {
    // 1. Validar se as senhas são iguais
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem. Tente novamente.");
      return;
    }

    // 2. Lógica de troca de senha (simulação)
    console.log("Trocando senha para:", { email, password });
    Alert.alert(
      "Sucesso!",
      "Sua senha foi trocada. Você será redirecionado para o login.",
      [
        { text: "OK", onPress: () => router.push("/login") }, // Redireciona
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Usamos o mesmo componente, só mudamos os textos */}
        <LogoHeader
          mainHeading="Troque sua senha"
          subHeading="E faça o login novamente"
        />

        <View style={styles.formContainer}>
          {/* Campo de E-mail (estava correto) */}
          <View style={styles.mb4}>
            <Text style={styles.label}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={styles.textInput} // <-- Este estilo (textInput) SÓ se aplica aqui
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* =================================== */}
          {/* CAMPO "SENHA" (CORRIGIDO)           */}
          {/* =================================== */}
          <View style={styles.mb4}>
            <Text style={styles.label}>Senha:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Sua senha"
                style={styles.textInputInsideWrapper}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPass} // <-- Usa !showPass
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPass(!showPass)} // <-- Usa setShowPass
              >
                {/* Lógica corrigida: */}
                {showPass ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
          </View>

          {/* =================================== */}
          {/* CAMPO "CONFIRMAR SENHA" (CORRIGIDO) */}
          {/* =================================== */}
          <View style={styles.mb4}>
            <Text style={styles.label}>Confirmar Senha:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Confirmar senha"
                style={styles.textInputInsideWrapper}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPass} // <-- Usa !showConfirmPass
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPass(!showConfirmPass)} // <-- Usa setShowConfirmPass
              >
                {/* Lógica corrigida: */}
                {showConfirmPass ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>TROCAR SENHA</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkOrange}>Voltar para o login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (O seu código estava perfeito aqui!)
// Eu só adicionei o estilo 'textInput' que faltava para o campo de e-mail
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#d4d4d4ff",
  },
  cardContainer: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 30, // Borda arredondada do Figma
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mb4: {
    marginBottom: 16, // Usamos este para espaçamento (substitui o inputGroup)
  },
  label: {
    color: "#2C2C2C",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },

  // Adicionei este estilo de volta (para o campo de E-mail)
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12, // Borda arredondada
    width: "100%",
    fontSize: 16,
    color: "#2C2C2C",
  },

  // ===================================
  // NOVOS ESTILOS PARA CENTRALIZAR O ÍCONE
  // ===================================
  inputWrapper: {
    flexDirection: "row", // Coloca o input e o ícone lado a lado
    alignItems: "center", // <<-- A MÁGICA! Centraliza verticalmente!
    position: "relative", // Permite o ícone ficar absoluto dentro dela
    width: "100%",
    borderColor: "#D1D5DB", // Borda
    borderWidth: 1,
    borderRadius: 12, // Borda arredondada
  },
  textInputInsideWrapper: {
    flex: 1, // Faz o input ocupar todo o espaço menos o do ícone
    padding: 12,
    fontSize: 16,
    color: "#2C2C2C",
    paddingRight: 40, // Adiciona espaço à direita para o ícone não sobrepor o texto
  },
  eyeIcon: {
    position: "absolute", // Absoluto em relação ao inputWrapper
    right: 12, // 12px da direita
    opacity: 0.6,
  },
  // ===================================

  // O resto dos estilos
  button: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#FF5722",
    borderRadius: 12,
  },
  buttonText: {
    color: "#000000", // Texto preto do Figma
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  linksContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  linkOrange: {
    color: "#FF5722",
    fontSize: 14,
    fontWeight: "700", // Negrito
  },
});
