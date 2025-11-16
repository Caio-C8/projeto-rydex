import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet } from 'react-native';

// --- Funções de Escala e Cores ---
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const horizontalScale = (size) => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = (size) => (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;
const COLORS = { primary: "#ff8c00", textMuted: "#000000", white: "#fff", border: "#dfe6e9" };
// --- Fim ---

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
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
        name="carteira" // Corresponde a explore.tsx (Carteira)
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

// Estilos específicos para a TabBar
const styles = StyleSheet.create({
    tabBar: {
        height: verticalScale(80), // Altura responsiva
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: verticalScale(10), // Espaço inferior para segurança
        paddingTop: verticalScale(5),
    },
    tabBarLabel: {
        fontSize: moderateScale(11),
        marginBottom: verticalScale(-5), // Aproxima o texto do ícone
    },
    tabBarItem: {
        // Estilos para cada item individual, se necessário
    }
});