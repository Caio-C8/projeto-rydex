import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon, CloudUploadIcon } from "../components/Icons";
import * as ImagePicker from "expo-image-picker"; // Importa o seletor de imagens

export default function RegisterScreen() {
  // Estado para os arquivos
  const [cnhFile, setCnhFile] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<string | null>(null);

  // Estados de senha
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Função para pegar imagem da CNH
  const handlePickCnh = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCnhFile(result.assets[0].uri.split("/").pop() || "imagem.jpg");
    }
  };

  // Função para pegar imagem do Doc
  const handlePickDoc = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setDocFile(result.assets[0].uri.split("/").pop() || "documento.jpg");
    }
  };

  const handleSubmit = () => {
    Alert.alert("Cadastro", "Cadastro enviado! (simulação)");
    // Lógica de cadastro...
    // router.push('/login');
  };

  return (
    <ScrollView
      className="bg-bg-light"
      contentContainerClassName="card-container"
      keyboardShouldPersistTaps="handled"
    >
      <LogoHeader
        mainHeading="É um novo entregador(a)?"
        subHeading="Realize seu cadastro e comece a fazer entregas"
      />

      <View className="w-full bg-white p-6 md:p-8 rounded-xl shadow-lg">
        {/* Nome Completo */}
        <View className="mb-4">
          <Text className="block text-rydex-gray text-sm font-medium mb-2">
            Nome completo:
          </Text>
          <TextInput
            placeholder="Seu nome"
            className="text-rydex-gray"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* CPF e Data de Nasc. */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="block text-rydex-gray text-sm font-medium mb-2">
              CPF:
            </Text>
            <TextInput
              placeholder="xxx.xxx.xxx-xx"
              className="text-rydex-gray"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="block text-rydex-gray text-sm font-medium mb-2">
              Data de nasc.:
            </Text>
            <TextInput
              placeholder="dd/mm/aaaa"
              className="text-rydex-gray"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* ... (Outros campos: Celular, Placa, Pix, E-mail) ... */}

        {/* Senha */}
        <View className="mb-4 input-group">
          <Text className="block text-rydex-gray text-sm font-medium mb-2">
            Senha:
          </Text>
          <TextInput
            placeholder="Sua senha"
            className="text-rydex-gray"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPass}
          />
          <TouchableOpacity
            className="eye-icon"
            onPress={() => setShowPass(!showPass)}
          >
            <EyeIcon />
          </TouchableOpacity>
        </View>

        {/* Confirmar Senha */}
        <View className="mb-6 input-group">
          <Text className="block text-rydex-gray text-sm font-medium mb-2">
            Confirmar senha:
          </Text>
          <TextInput
            placeholder="Confirmar senha"
            className="text-rydex-gray"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirmPass}
          />
          <TouchableOpacity
            className="eye-icon"
            onPress={() => setShowConfirmPass(!showConfirmPass)}
          >
            <EyeIcon />
          </TouchableOpacity>
        </View>

        {/* CNH e Doc. Veículo */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Text className="block text-rydex-gray text-sm font-medium mb-2">
              CNH:
            </Text>
            <TouchableOpacity
              className="upload-area rounded-xl"
              onPress={handlePickCnh}
            >
              <CloudUploadIcon />
              <Text
                className="text-xs text-rydex-gray mt-1 text-center"
                numberOfLines={1}
              >
                {cnhFile || "Envie uma foto"}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="block text-rydex-gray text-sm font-medium mb-2">
              Doc. veículo:
            </Text>
            <TouchableOpacity
              className="upload-area rounded-xl"
              onPress={handlePickDoc}
            >
              <CloudUploadIcon />
              <Text
                className="text-xs text-rydex-gray mt-1 text-center"
                numberOfLines={1}
              >
                {docFile || "Envie uma foto"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="w-full py-3 bg-rydex-orange rounded-xl"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-center">CADASTRAR</Text>
        </TouchableOpacity>

        <View className="text-center mt-6 items-center">
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-rydex-orange text-sm font-semibold">
                Já sou cadastrado
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
