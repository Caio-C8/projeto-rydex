import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// 1. Importamos o contexto de Autenticação
import { AuthProvider } from '../context/AuthContext';

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    // 2. Envolvemos o app com o AuthProvider
    <AuthProvider>
      {/* 3. Forçamos o DefaultTheme (Claro) para evitar telas pretas */}
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          
          {/* Tela inicial de redirecionamento */}
          <Stack.Screen name="index" />

          {/* Abas Principais */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />

          {/* --- TELAS DE AUTENTICAÇÃO --- */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />

          {/* --- TELAS DE CORRIDA (Adicionadas para a navegação funcionar) --- */}
          <Stack.Screen name="corrida-em-andamento" />
          <Stack.Screen name="corrida-entrega-final" />
          <Stack.Screen name="corrida-retorno" />

          {/* --- TELAS DE SAQUE --- */}
          <Stack.Screen
            name="saque-sucesso"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="saque-erro"
            options={{ presentation: "modal" }}
          />

        </Stack>
        {/* Força a barra de status com texto escuro */}
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}