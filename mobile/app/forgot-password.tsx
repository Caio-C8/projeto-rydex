import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { LogoHeader } from "../components/LogoHeader";
import { EyeIcon } from "../components/Icons";

export default function ForgotPasswordScreen() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = () => {
    Alert.alert("Sucesso", "Senha trocada! (simulação)");
    // Lógica de troca de senha...
  };

  return (
    <ScrollView
      className="bg-bg-light"
      contentContainerClassName="card-container"
      keyboardShouldPersistTaps="handled"
    >
      <LogoHeader
        mainHeading="Troque sua senha"
        subHeading="E faça o login novamente"
      />

      <View className="w-full bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <View className="mb-4">
          <Text className="block text-rydex-gray text-sm font-medium mb-2">
            E-mail:
          </Text>
          <TextInput
            placeholder="exemplo@email.com"
            className="text-rydex-gray"
            placeholderTextColor="#9CA3AF"
          />
        </View>

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

        <View className="mb-6 input-group">
          <Text className="block text-rydex-gray text-sm font-medium mb-2">
            Confirmar Senha:
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

        <TouchableOpacity
          className="w-full py-3 bg-rydex-orange rounded-xl"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-center">TROCAR SENHA</Text>
        </TouchableOpacity>

        <View className="text-center mt-6 items-center">
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-rydex-orange text-sm font-semibold">
                Voltar para o login
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
