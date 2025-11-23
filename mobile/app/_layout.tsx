import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/context/AuthContext";
import { TrackingProvider } from "@/context/TrackingContext";

// Mantém a tela de splash visível enquanto carregamos recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
<<<<<<< HEAD
  // 1. Carregamento de fontes (Se não tiver fontes customizadas, pode deixar vazio, mas a lógica precisa existir)
  const [loaded] = useFonts({
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'), // Exemplo
  });

  // 2. Efeito para esconder o Splash Screen quando tudo estiver pronto
=======
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

>>>>>>> cf9c9b1377df0a639fe9f62509da33af01b00787
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

<<<<<<< HEAD
  // 3. Enquanto não carrega, não renderiza nada (o Splash ainda está na tela)
=======
>>>>>>> cf9c9b1377df0a639fe9f62509da33af01b00787
  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <TrackingProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen
              name="forgot-password"
              options={{ headerShown: false }}
            />
            {/* Adicionei essa rota para sumir com o Warning do +not-found se você não tiver o arquivo */}
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TrackingProvider>
    </AuthProvider>
  );
}