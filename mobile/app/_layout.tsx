import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // --- SEU CÓDIGO ORIGINAL (MANTIDO) ---
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* --- SEU CÓDIGO ORIGINAL (MANTIDO) --- */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />

        {/* --- MINHAS ADIÇÕES (INTEGRAÇÃO) --- */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen
          name="saque-sucesso"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="saque-erro"
          options={{ presentation: "modal" }}
        />
        {/* --- FIM DAS ADIÇÕES --- */}

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    // --- FIM DO SEU CÓDIGO ORIGINAL ---
  );
}