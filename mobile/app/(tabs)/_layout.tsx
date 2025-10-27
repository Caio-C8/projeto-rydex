import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native"; 
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";

const activeColor = "#FF5722";
const inactiveColor = "#8E8E93";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor, // Cor do ícone e texto ativos (laranja)
        tabBarInactiveTintColor: inactiveColor, // Cor dos inativos (cinza)
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index" // Tela de Início
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            // Este View é o "wrapper" do ícone
            <View
              style={[
                styles.tabIconContainer,
                // Se 'focused' for true, a borda fica laranja, senão fica transparente
                { borderTopColor: focused ? activeColor : "transparent" },
              ]}
            >
              <FontAwesome size={28} name="home" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="historico" // Tela de Histórico
        options={{
          title: "Histórico",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                { borderTopColor: focused ? activeColor : "transparent" },
              ]}
            >
              <MaterialIcons size={28} name="history" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="carteira" // Tela da Carteira
        options={{
          title: "Carteira",
          // Removemos o 'tabBarIconStyle' estático que eu tinha colocado antes
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                { borderTopColor: focused ? activeColor : "transparent" },
              ]}
            >
              <Ionicons size={28} name="wallet" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil" // Tela de Perfil
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                { borderTopColor: focused ? activeColor : "transparent" },
              ]}
            >
              <FontAwesome size={28} name="user" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// ===============================================
// ESTILOS (Adicionamos um estilo para o "wrapper" do ícone)
// ===============================================
const styles = StyleSheet.create({
  tabIconContainer: {
    flex: 1, // Ocupa todo o espaço do ícone
    width: "100%", // Ocupa toda a largura
    justifyContent: "center", // Centraliza o ícone verticalmente
    alignItems: "center", // Centraliza o ícone horizontalmente
    borderTopWidth: 3, // A barra (seja laranja ou transparente)
    marginTop: -5, // Puxa o ícone para cima (como no seu Figma)
  },
});
