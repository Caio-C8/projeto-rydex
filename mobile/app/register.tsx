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
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, EyeOffIcon, CloudUploadIcon } from "../components/Icons";
import * as ImagePicker from "expo-image-picker";

// Imports de Serviço e Tipos
import {
  Colors,
  FontSizes,
  Fonts,
  verticalScale,
  horizontalScale,
} from "../constants/theme";
import { entregadoresService } from "../services/entregadores.service";
import { tratarErroApi } from "../utils/api-error-handler";
import { ImageFile } from "../types/dtos";

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
  const [cnhAsset, setCnhAsset] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const [docAsset, setDocAsset] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );

  // Estados de controle
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  // --- MÁSCARAS E FORMATAÇÃO ---

  // Máscara de DATA (DD/MM/AAAA)
  const handleDateChange = (text: string) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    // Adiciona as barras automaticamente
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
        2,
        4
      )}/${cleaned.slice(4, 8)}`;
    }
    setDataNasc(formatted);
  };

  // Máscara de CPF (000.000.000-00)
  const handleCpfChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 3)
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length > 6)
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(
        3,
        6
      )}.${cleaned.slice(6)}`;
    if (cleaned.length > 9)
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(
        3,
        6
      )}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;

    setCpf(formatted);
  };

  // Máscara de Celular ( (00) 00000-0000 )
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 0) formatted = `(${cleaned}`;
    if (cleaned.length > 2)
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length > 7)
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(
        2,
        7
      )}-${cleaned.slice(7, 11)}`;

    setCelular(formatted);
  };

  // Converte DD/MM/AAAA para AAAA-MM-DD
  const formatDataToISO = (dateStr: string) => {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Função para pegar imagem
  const handlePickImage = async (
    setter: React.Dispatch<
      React.SetStateAction<ImagePicker.ImagePickerAsset | null>
    >
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos da permissão da galeria."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setter(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    // 1. Validações Básicas
    if (!nome || !cpf || !email || !password || !dataNasc) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (dataNasc.length !== 10) {
      Alert.alert("Atenção", "Data de nascimento inválida. Use DD/MM/AAAA");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem.");
      return;
    }

    // 2. Prepara os arquivos
    let cnhFile: ImageFile | undefined;
    if (cnhAsset) {
      cnhFile = {
        uri: cnhAsset.uri,
        name: cnhAsset.fileName || `cnh_${Date.now()}.jpg`,
        type: cnhAsset.mimeType || "image/jpeg",
      };
    }

    let docFile: ImageFile | undefined;
    if (docAsset) {
      docFile = {
        uri: docAsset.uri,
        name: docAsset.fileName || `doc_${Date.now()}.jpg`,
        type: docAsset.mimeType || "image/jpeg",
      };
    }

    setIsLoading(true);

    try {
      // 3. LIMPEZA DE DADOS (Remove formatação visual)
      const cpfLimpo = cpf.replace(/\D/g, ""); // Só números
      const celularLimpo = celular.replace(/\D/g, ""); // Só números

      // 4. Chamada ao serviço
      await entregadoresService.criarEntregador(
        {
          nome,
          cpf: cpfLimpo,
          email,
          senha: password,
          confirmar_senha: confirmPassword,
          celular: celularLimpo,
          placaVeiculo: placa.toUpperCase(), // Garante maiúsculo
          chavePix: pix,
          dataNascimento: formatDataToISO(dataNasc),
        },
        cnhFile,
        docFile
      );

      // 5. Sucesso
      Alert.alert(
        "Cadastro Realizado!",
        "Sua conta foi criada com sucesso. Faça login para continuar.",
        [{ text: "OK", onPress: () => router.push("/login") }]
      );
    } catch (error) {
      const msg = tratarErroApi(error);
      Alert.alert("Erro no Cadastro", msg);
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
          mainHeading="É um novo entregador(a)?"
          subHeading="Realize seu cadastro e comece a fazer entregas"
        />

        <View
          style={[
            styles.formContainer,
            { backgroundColor: themeColors.background },
          ]}
        >
          {/* Linha 1: Nome Completo */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              Nome completo:
            </Text>
            <TextInput
              placeholder="Seu nome"
              style={[
                styles.textInput,
                { borderColor: themeColors.lightGray, color: themeColors.text },
              ]}
              placeholderTextColor={themeColors.textGray}
              onChangeText={setNome}
              value={nome}
              editable={!isLoading}
            />
          </View>

          {/* Linha 2: CPF e Data de Nasc. */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                CPF:
              </Text>
              <TextInput
                placeholder="000.000.000-00"
                style={[
                  styles.textInput,
                  {
                    borderColor: themeColors.lightGray,
                    color: themeColors.text,
                  },
                ]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="numeric"
                onChangeText={handleCpfChange} // USANDO MÁSCARA
                value={cpf}
                maxLength={14} // Limite com formatação
                editable={!isLoading}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Data nascimento:
              </Text>
              <TextInput
                placeholder="DD/MM/AAAA"
                style={[
                  styles.textInput,
                  {
                    borderColor: themeColors.lightGray,
                    color: themeColors.text,
                  },
                ]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="numeric"
                onChangeText={handleDateChange} // USANDO MÁSCARA
                value={dataNasc}
                maxLength={10} // Limite DD/MM/AAAA
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Linha 3: Celular e Placa */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Celular:
              </Text>
              <TextInput
                placeholder="(xx) xxxxx-xxxx"
                style={[
                  styles.textInput,
                  {
                    borderColor: themeColors.lightGray,
                    color: themeColors.text,
                  },
                ]}
                placeholderTextColor={themeColors.textGray}
                keyboardType="phone-pad"
                onChangeText={handlePhoneChange} // USANDO MÁSCARA
                value={celular}
                maxLength={15}
                editable={!isLoading}
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Placa veículo:
              </Text>
              <TextInput
                placeholder="XXX0X00"
                style={[
                  styles.textInput,
                  {
                    borderColor: themeColors.lightGray,
                    color: themeColors.text,
                  },
                ]}
                placeholderTextColor={themeColors.textGray}
                autoCapitalize="characters"
                onChangeText={setPlaca}
                value={placa}
                maxLength={8}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Linha 4: Chave Pix */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              Chave pix:
            </Text>
            <TextInput
              placeholder="CPF, celular, e-mail..."
              style={[
                styles.textInput,
                { borderColor: themeColors.lightGray, color: themeColors.text },
              ]}
              placeholderTextColor={themeColors.textGray}
              onChangeText={setPix}
              value={pix}
              editable={!isLoading}
            />
          </View>

          {/* Linha 5: E-mail */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              E-mail:
            </Text>
            <TextInput
              placeholder="exemplo@email.com"
              style={[
                styles.textInput,
                { borderColor: themeColors.lightGray, color: themeColors.text },
              ]}
              placeholderTextColor={themeColors.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
              editable={!isLoading}
            />
          </View>

          {/* Linha 6: Senha */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              Senha:
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: themeColors.lightGray },
              ]}
            >
              <TextInput
                placeholder="Sua senha"
                style={[
                  styles.textInputInsideWrapper,
                  { color: themeColors.text },
                ]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showPass}
                onChangeText={setPassword}
                value={password}
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

          {/* Linha 7: Confirmar Senha */}
          <View style={styles.mb4}>
            <Text style={[styles.label, { color: themeColors.text }]}>
              Confirmar senha:
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: themeColors.lightGray },
              ]}
            >
              <TextInput
                placeholder="Confirmar senha"
                style={[
                  styles.textInputInsideWrapper,
                  { color: themeColors.text },
                ]}
                placeholderTextColor={themeColors.textGray}
                secureTextEntry={!showConfirmPass}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
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

          {/* Linha 8: CNH e Doc. Veículo */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                CNH:
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadArea,
                  {
                    borderColor: themeColors.lightGray,
                    backgroundColor: themeColors.appBackground,
                  },
                ]}
                onPress={() => handlePickImage(setCnhAsset)}
                disabled={isLoading}
              >
                <CloudUploadIcon />
                <Text
                  style={[styles.uploadText, { color: themeColors.rydexGray }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cnhAsset?.fileName || "Envie uma foto"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Doc. veículo:
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadArea,
                  {
                    borderColor: themeColors.lightGray,
                    backgroundColor: themeColors.appBackground,
                  },
                ]}
                onPress={() => handlePickImage(setDocAsset)}
                disabled={isLoading}
              >
                <CloudUploadIcon />
                <Text
                  style={[styles.uploadText, { color: themeColors.rydexGray }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {docAsset?.fileName || "Envie uma foto"}
                </Text>
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
              <ActivityIndicator color={themeColors.rydexGray} />
            ) : (
              <Text
                style={[styles.buttonText, { color: themeColors.rydexGray }]}
              >
                CADASTRAR
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
                  Já sou cadastrado
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
// ESTILOS (Mantidos iguais)
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
