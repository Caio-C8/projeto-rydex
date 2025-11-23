import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Platform, View } from 'react-native';

// Podemos manter os imports de fonte, mas vamos fixar as cores aqui para garantir
import { Fonts } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 1. COR LARANJA FIXA (Garante que não fique azul)
        tabBarActiveTintColor: '#FF5722', 
        tabBarInactiveTintColor: '#999999', // Cinza para inativo
        
        // 2. ESTILO DA BARRA (Fundo Branco e Alinhamento)
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#EFEFEF',
            // Altura fixa para cobrir o "buraco" do Android
            height: Platform.OS === 'ios' ? 90 : 80, 
            // Espaçamento interno para centralizar
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 8,
            // Sombra suave para ficar bonito
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 },
        },
        
        // 3. ESTILO DO TEXTO
        tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: Fonts.sans,
            marginTop: 2,
            fontWeight: '600',
        },
        
        // 4. ESTILO DO ITEM (Centraliza o conjunto Ícone + Texto)
        tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
        }
      }}
    >
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} iconFamily="Ionicons" iconName={focused ? 'home' : 'home-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico" 
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} iconFamily="MaterialIcons" iconName="history" />
          ),
        }}
      />
      <Tabs.Screen
        name="carteira" 
        options={{
          title: 'Carteira',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} iconFamily="Ionicons" iconName={focused ? 'wallet' : 'wallet-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} iconFamily="Ionicons" iconName={focused ? 'person-circle' : 'person-circle-outline'} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}

// --- Componente para o Ícone + Linha Laranja ---
interface TabIconProps {
    focused: boolean;
    color: string;
    iconName: any;
    iconFamily: 'Ionicons' | 'MaterialIcons' | 'FontAwesome';
    size?: number;
}

const TabIcon = ({ focused, color, iconName, iconFamily, size = 24 }: TabIconProps) => {
    return (
        <View style={styles.iconContainer}>
            {/* Linha laranja no topo do ícone */}
            {focused && <View style={styles.activeLine} />}
            
            {iconFamily === 'Ionicons' && <Ionicons name={iconName} size={size} color={color} />}
            {iconFamily === 'MaterialIcons' && <MaterialIcons name={iconName} size={size} color={color} />}
            {iconFamily === 'FontAwesome' && <FontAwesome name={iconName} size={size} color={color} />}
        </View>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50, 
    },
    activeLine: {
        position: 'absolute',
        top: -14, // Ajuste fino da linha
        width: 40,
        height: 3,
        backgroundColor: '#FF5722', // Laranja Rydex
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    }
});