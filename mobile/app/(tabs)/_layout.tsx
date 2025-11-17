import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useColorScheme } from 'react-native'; // 1. Importado 'useColorScheme'

// 2. Importado do seu novo theme.ts (subindo dois níveis: ../../)
// Removemos as definições locais de cores e escalas
import { Colors, Fonts, verticalScale, horizontalScale, moderateScale } from '../../constants/theme';

export default function TabLayout() {
  // 3. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 4. Cores dinâmicas aplicadas
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
        // 5. Estilos de fundo e borda dinâmicos aplicados
        tabBarStyle: [
          styles.tabBar,
          { 
            backgroundColor: themeColors.white, // O fundo da tab é sempre branco (no seu tema)
            borderTopColor: themeColors.border 
          }
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index" // Corresponde a index.tsx
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={moderateScale(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico" // Corresponde a historico.tsx
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={moderateScale(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carteira" // Corresponde a carteira.tsx
        options={{
          title: 'Carteira',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={moderateScale(24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil" // Corresponde a perfil.tsx
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={moderateScale(26)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// ===============================================
// ESTILOS (ATUALIZADOS COM ESCALA RESPONSIVA)
// (Removemos as cores fixas daqui)
// ===============================================
const styles = StyleSheet.create({
    tabBar: {
        height: verticalScale(80), // Altura responsiva (do seu código)
        borderTopWidth: 1,
        paddingBottom: verticalScale(10), // Espaço inferior (do seu código)
        paddingTop: verticalScale(5),
        // Cores de fundo e borda são aplicadas dinamicamente no JSX
    },
    tabBarLabel: {
        fontSize: moderateScale(11),
        marginBottom: verticalScale(-5), // Aproxima o texto (do seu código)
        fontFamily: Fonts.default.sans, // Adiciona a fonte padrão
    },
    tabBarItem: {
        // Estilos para cada item individual, se necessário
    }
});