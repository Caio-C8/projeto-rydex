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
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon, CloudUploadIcon } from "../components/Icons";
import * as ImagePicker from "expo-image-picker"; // Importa o seletor de imagens

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

  // Estados para os arquivos (apenas para mostrar o nome)
  const [cnhFile, setCnhFile] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<string | null>(null);

  // Estados de visibilidade da senha
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Função para pegar imagem (reutilizável)
  const handlePickImage = async (
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    // Pedir permissão (necessário no iOS)
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
      // Pega apenas o nome do arquivo para exibir na UI
      setter(result.assets[0].uri.split("/").pop() || "imagem.jpg");
    }
  };

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem. Tente novamente.");
      return;
    }
    // Lógica de cadastro (simulação)
    console.log("Cadastrando usuário...");
    Alert.alert(
      "Cadastro Realizado!",
      "Seu cadastro foi enviado para análise.",
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
        <LogoHeader
          mainHeading="É um novo entregador(a)?"
          subHeading="Realize seu cadastro e comece a fazer entregas"
        />

        <View style={styles.formContainer}>
          {/* Linha 1: Nome Completo */}
          <View style={styles.mb4}>
            <Text style={styles.label}>Nome completo:</Text>
            <TextInput
              placeholder="Seu nome"
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
              onChangeText={setNome}
            />
          </View>

          {/* Linha 2: CPF e Data de Nasc. (Grid) */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.label}>CPF:</Text>
              <TextInput
                placeholder="xxx.xxx.xxx-xx"
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                onChangeText={setCpf}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Data de nascimento:</Text>
              <TextInput
                placeholder="dd/mm/aaaa"
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                onChangeText={setDataNasc}
              />
            </View>
          </View>

          {/* Linha 3: Celular e Placa (Grid) */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Celular:</Text>
              <TextInput
                placeholder="[xx] x xxxx-xxxx"
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                onChangeText={setCelular}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Placa veículo:</Text>
              <TextInput
                placeholder="XXX0X00"
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                onChangeText={setPlaca}
              />
            </View>
          </View>

          {/* Linha 4: Chave Pix */}
          <View style={styles.mb4}>
            <Text style={styles.label}>Chave pix:</Text>
            <TextInput
              placeholder="E-mail, CPF, celular, chave aleatória"
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
              onChangeText={setPix}
            />
          </View>

          {/* Linha 5: E-mail */}
          <View style={styles.mb4}>
            <Text style={styles.label}>E-mail:</Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
            />
          </View>

          {/* Linha 6: Senha (com ícone) */}
          <View style={styles.mb4}>
            <Text style={styles.label}>Senha:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Sua senha"
                style={styles.textInputInsideWrapper}
                placeholderTextColor="#9CA3AF"
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
            <Text style={styles.label}>Confirmar senha:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Confirmar senha"
                style={styles.textInputInsideWrapper}
                placeholderTextColor="#9CA3AF"
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
              <Text style={styles.label}>CNH:</Text>
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={() => handlePickImage(setCnhFile)}
              >
                <CloudUploadIcon />
                <Text
                  style={styles.uploadText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cnhFile || "Envie uma foto"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.label}>Doc. veículo:</Text>
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={() => handlePickImage(setDocFile)}
              >
                <CloudUploadIcon />
                <Text
                  style={styles.uploadText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {docFile || "Envie uma foto"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* O botão no seu Figma está escrito "TROCAR SENHA", 
              mas o correto para essa tela seria "CADASTRAR". 
              Estou usando "CADASTRAR".
          */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>CADASTRAR</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkOrange}>Já sou cadastrado</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (Reaproveitando e adicionando novos)
// ===============================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#d4d4d4ff" },
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
  mb4: { marginBottom: 16 },
  label: { color: "#2C2C2C", fontSize: 14, fontWeight: "500", marginBottom: 8 },

  // Estilo para campos de texto normais (sem ícone)
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    width: "100%",
    fontSize: 16,
    color: "#2C2C2C",
  },

  // Estilos para os campos de senha (com ícone)
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 12,
  },
  textInputInsideWrapper: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#2C2C2C",
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    opacity: 0.6,
  },

  // Estilos para o Grid (NOVOS)
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16, // Espaço entre as colunas
  },
  gridCol: {
    flex: 1, // Faz com que as colunas dividam o espaço
  },

  // Estilos para Upload (NOVOS)
  uploadArea: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    backgroundColor: "#FAFAFA",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 8, // Adiciona padding para o texto não colar na borda
  },
  uploadText: {
    fontSize: 12,
    color: "#2C2C2C",
    marginTop: 8,
    textAlign: "center",
  },

  // Botão e Links (iguais ao login/forgot)
  button: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#FF5722",
    borderRadius: 12,
  },
  buttonText: {
    color: "#000000",
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
    fontWeight: "700",
  },
});
