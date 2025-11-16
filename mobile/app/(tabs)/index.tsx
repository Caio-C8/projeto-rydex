import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  // Esta é a sua tela "Início" (Home).
  // No futuro, ela terá a lista de corridas disponíveis.

  const simularAceiteDeCorrida = () => {
    // Quando o usuário "aceitar" uma corrida,
    // nós o navegamos para a tela do mapa que criamos.
    router.push('/corrida-em-andamento');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Início</Text>
      <Text style={styles.subtitle}>
        Procurando por entregas...
      </Text>

      {/* Botão de simulação (APENAS PARA TESTE) */}
      <Button 
        title="Simular Aceite de Corrida" 
        onPress={simularAceiteDeCorrida} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#004D61', // Azul Rydex
  },
  subtitle: {
    fontSize: 16,
    color: '#2C2C2C', // Cinza Rydex
    padding: 20,
    textAlign: 'center',
  },
});