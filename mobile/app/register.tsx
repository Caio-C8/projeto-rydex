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
  ActivityIndicator, // Adicionado para feedback visual
} from "react-native";
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon, CloudUploadIcon } from "../components/Icons";
import * as ImagePicker from "expo-image-picker";

import { Colors, FontSizes, Fonts, verticalScale, horizontalScale } from '../constants/theme';
// 1. Import da API
import api from "../services/api";

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

  // Estados para os arquivos (URI completa)
  const [cnhFile, setCnhFile] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<string | null>(null);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  // 2. Estado de Loading
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handlePickImage = async (
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos da permissão da galeria.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, // Diminui um pouco a qualidade para o upload ser mais rápido
    });

    if (!result.canceled) {
      // 3. Salvamos a URI completa para poder fazer o upload
      setter(result.assets[0].uri);
    }
  };

  // 4. Função de Envio para o Backend
  const handleSubmit = async () => {
    // Validações básicas
    if (!nome || !email || !password || !cpf) {
      return Alert.alert("Atenção", "Preencha os campos obrigatórios.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Erro", "As senhas não conferem.");
    }
    if (!cnhFile || !docFile) {
      return Alert.alert("Atenção", "É necessário enviar as fotos da CNH e do Veículo.");
    }

    setLoading(true);

    try {
      // 5. Criando o FormData (Pacote para envio de arquivos)
      const formData = new FormData();

      // Adicionando campos de texto
      // ATENÇÃO: Os nomes aqui (ex: 'nome', 'cpf') devem ser IGUAIS aos do seu DTO no Backend
      formData.append("nome", nome);
      formData.append("cpf", cpf);
      formData.append("dataNascimento", dataNasc); // Verifique se no back é dataNasc ou dataNascimento
      formData.append("celular", celular);
      formData.append("placaVeiculo", placa);      // Verifique se no back é placa ou placaVeiculo
      formData.append("chavePix", pix);            // Verifique se no back é pix ou chavePix
      formData.append("email", email);
      formData.append("senha", password);

      // Adicionando Arquivos
      // O React Native precisa desse objeto específico { uri, name, type }
      formData.append("imagemCnh", {
        uri: cnhFile,
        name: "cnh.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("imagemDocVeiculo", {
        uri: docFile,
        name: "doc.jpg",
        type: "image/jpeg",
      } as any);

      // 6. Enviando para a API
      // O Header 'multipart/form-data' é crucial para upload
      await api.post("/entregadores", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert(
        "Sucesso!",
        "Cadastro realizado. Agora faça login para entrar.",
        [{ text: "Ir para Login", onPress: () => router.push("/login") }]
      );

    } catch (error: any) {
      console.log("Erro no cadastro:", error);
      if (error.response) {
        // Mostra o erro que o Backend mandou (ex: CPF já existe)
        Alert.alert("Erro", error.response.data.message || "Falha ao cadastrar.");
      } else {
        Alert.alert("Erro de Conexão", "Verifique sua internet ou se o servidor está rodando.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LogoHeader
          mainHeading="É um novo entregador(a)?"
          subHeading="Realize seu cadastro e comece a fazer entregas"
        />

        <View style={[styles.formContainer, { backgroundColor: themeColors.background }]}>
          
          {/* Campos de texto... */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Nome completo:</Text>
            <TextInput
              placeholder="Seu nome"
              style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
              placeholderTextColor={themeColors.textGray}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>CPF:</Text>
              <TextInput
                placeholder="Apenas números"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="numeric"
                value={cpf}
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
                value={dataNasc}
                onChangeText={setDataNasc}
              />
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>Celular:</Text>
              <TextInput
                placeholder="(xx) 9xxxx-xxxx"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="phone-pad"
                value={celular}
                onChangeText={setCelular}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>Placa veículo:</Text>
              <TextInput
                placeholder="XXX-0000"
                style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
                placeholderTextColor={themeColors.textGray}
                autoCapitalize="characters"
                value={placa}
                onChangeText={setPlaca}
              />
            </View>
          </View>

          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Chave pix:</Text>
            <TextInput
              placeholder="E-mail, CPF, celular..."
              style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
              placeholderTextColor={themeColors.textGray}
              value={pix}
              onChangeText={setPix}
            />
          </View>

          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={[styles.textInput, { borderColor: themeColors.lightGray, color: themeColors.text }]}
              placeholderTextColor={themeColors.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Senha:</Text>
            <View style={[styles.inputWrapper, { borderColor: themeColors.lightGray }]}>
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

          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>Confirmar senha:</Text>
            <View style={[styles.inputWrapper, { borderColor: themeColors.lightGray }]}>
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

          {/* Uploads */}
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
                  {/* Mostra só o nome do arquivo para não quebrar o layout */}
                  {cnhFile ? cnhFile.split('/').pop() : "Envie uma foto"}
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
                  {docFile ? docFile.split('/').pop() : "Envie uma foto"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: loading ? '#ccc' : themeColors.rydexOrange }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
               <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { color: themeColors.textMuted }]}>CADASTRAR</Text>
            )}
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

// SEUS ESTILOS CONTINUAM IGUAIS
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
    marginBottom: verticalScale(16),
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
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
    gap: horizontalScale(16),
  },
  gridCol: {
    flex: 1,
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
    fontSize: FontSizes.small,
    marginTop: verticalScale(8),
    textAlign: "center",
    fontFamily: Fonts.sans,
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(12),
    borderRadius: 12,
    marginTop: verticalScale(8),
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