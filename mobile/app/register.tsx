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
import { EyeIcon, EyeOffIcon, CloudUploadIcon } from "../components/Icons";
import * as ImagePicker from "expo-image-picker";

// 2. Importado do seu novo theme.ts
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';

export default function RegisterScreen() {
  // Estados para os campos de texto
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [celular, setCelular] = useState("");
  const [placa, setPlaca] = useState("");
  const [pix, setPix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para os arquivos
  const [cnhFile, setCnhFile] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<string | null>(null);

  // Estados de visibilidade da senha
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Função para pegar imagem (reutilizável)
  const handlePickImage = async (
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos da permissão da galeria para o upload."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri.split("/").pop() || "imagem.jpg");
    }
  };

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem. Tente novamente.");
      return;
    }
    console.log("Cadastrando usuário...");
    Alert.alert(
      "Cadastro Realizado!",
      "Seu cadastro foi enviado para análise.",
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
          mainHeading="É um novo entregador(a)?"
          subHeading="Realize seu cadastro e comece a fazer entregas"
        />

        {/* 5. Cor de fundo do card dinâmica */}
        <View style={[styles.formContainer, { backgroundColor: themeColors.background }]}>
          
          {/* Linha 1: Nome Completo */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Nome completo:</Text>
            <TextInput
              placeholder="Seu nome"
              style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
              placeholderTextColor={themeColors.textGray}
              onChangeText={setNome}
            />
          </View>

          {/* Linha 2: CPF e Data de Nasc. (Grid) */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>CPF:</Text>
              <TextInput
                placeholder="xxx.xxx.xxx-xx"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="numeric"
                onChangeText={setCpf}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>Data de nascimento:</Text>
              <TextInput
                placeholder="dd/mm/aaaa"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="numeric"
                onChangeText={setDataNasc}
              />
            </View>
          </View>

          {/* Linha 3: Celular e Placa (Grid) */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>Celular:</Text>
              <TextInput
                placeholder="[xx] x xxxx-xxxx"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="phone-pad"
                onChangeText={setCelular}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>Placa veículo:</Text>
              <TextInput
                placeholder="XXX0X00"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                autoCapitalize="characters"
                onChangeText={setPlaca}
              />
            </View>
          </View>

          {/* Linha 4: Chave Pix */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Chave pix:</Text>
            <TextInput
              placeholder="E-mail, CPF, celular, chave aleatória"
              style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
              placeholderTextColor={themeColors.textGray}
              onChangeText={setPix}
            />
          </View>

          {/* Linha 5: E-mail */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
              placeholderTextColor={themeColors.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
            />
          </View>

          {/* Linha 6: Senha (com ícone) */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Senha:</Text>
            <View style={[styles.inputWrapper, { borderColor: themeColors.lightGray }]}>
              <TextInput
                placeholder="Sua senha"
                style={[styles.textInputInsideWrapper, { color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showPass}
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

          {/* Linha 7: Confirmar Senha (com ícone) */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Confirmar senha:</Text>
            <View style={[styles.inputWrapper, { borderColor: themeColors.lightGray }]}>
              <TextInput
                placeholder="Confirmar senha"
                style={[styles.textInputInsideWrapper, { color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showConfirmPass}
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

          {/* Linha 8: CNH e Doc. Veículo (Grid) */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>CNH:</Text>
              <TouchableOpacity
                style={[styles.uploadArea, { borderColor: themeColors.lightGray, backgroundColor: themeColors.appBackground }]}
                onPress={() => handlePickImage(setCnhFile)}
              >
                <CloudUploadIcon />
                <Text
                  style={[styles.uploadText, { color: themeColors.rydexGray }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cnhFile || "Envie uma foto"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>Doc. veículo:</Text>
              <TouchableOpacity
                style={[styles.uploadArea, { borderColor: themeColors.lightGray, backgroundColor: themeColors.appBackground }]}
                onPress={() => handlePickImage(setDocFile)}
              >
                <CloudUploadIcon />
                <Text
                  style={[styles.uploadText, { color: themeColors.rydexGray }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {docFile || "Envie uma foto"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.rydexOrange }]} 
            onPress={handleSubmit}
          >
            <Text style={[styles.buttonText, { color: themeColors.textMuted }]}>CADASTRAR</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.linkOrange, { color: themeColors.rydexOrange }]}>Já sou cadastrado</Text>
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
    marginBottom: verticalScale(16), // Espaçamento padrão
  },
  label: { 
    fontSize: FontSizes.caption, // Usa FontSizes
    fontWeight: "500", 
    marginBottom: verticalScale(8), // Usa escala
    fontFamily: Fonts.sans, // Usa Fonts
  },
  textInput: {
    padding: verticalScale(12),
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
    fontSize: FontSizes.body,
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
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
    paddingRight: horizontalScale(40),
  },
  eyeIcon: {
    position: "absolute",
    right: horizontalScale(12),
    opacity: 0.6,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
    gap: horizontalScale(16), // Espaço entre as colunas
  },
  gridCol: {
    flex: 1, // Faz com que as colunas dividam o espaço
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    height: verticalScale(120),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: horizontalScale(8), 
  },
  uploadText: {
    fontSize: FontSizes.small, // Usa FontSizes
    marginTop: verticalScale(8),
    textAlign: "center",
    fontFamily: Fonts.sans,
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(12),
    borderRadius: 12,
    marginTop: verticalScale(8), // Adiciona um espaço antes do botão
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