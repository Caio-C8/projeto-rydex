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
    // Aqui você navegaria para a tela principal
    // Ex: router.push('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
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
              style={styles.textInput}
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
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
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
// ESTILOS
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#dadadaff", // bg-light
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
    borderRadius: 30,
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
    color: "#2C2C2C",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    width: "100%",
    fontSize: 16,
    color: "#2C2C2C",
  },
  inputGroup: {
    position: "relative",
    marginBottom: 24,
  },
  eyeIcon: {
    position: "absolute",
    top: 45, // Ajuste manual da posição do ícone
    right: 12,
    opacity: 0.6,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#FF5722",
    borderRadius: 12,
  },
  buttonText: {
    color: "#2C2C2C",
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
    color: "#FF5722",
    fontSize: 14,
    fontWeight: "700",
  },
  linkGray: {
    color: "#2C2C2C",
    fontSize: 14,
    fontWeight: "700",
  },
});
