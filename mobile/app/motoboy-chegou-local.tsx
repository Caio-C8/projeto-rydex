import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  Alert // Precisamos do Alert para o botão "Cheguei"
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps'; // Importa o Mapa
import { router } from 'expo-router';
// Importa os ícones que vamos usar
import { FontAwesome, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; 

// --- Coordenadas de Simulação ---
// (No app real, isso viria da sua API de rotas)
const userLocation = { latitude: -18.5895, longitude: -46.5135 }; // Ponto Azul (Local do usuário)
const pickupLocation = { latitude: -18.5900, longitude: -46.5180 }; // Ponto A (Destino)
// A rota desenhada
const routeCoordinates = [
  userLocation,
  { latitude: -18.5898, longitude: -46.5145 },
  { latitude: -18.5910, longitude: -46.5150 },
  { latitude: -18.5905, longitude: -46.5175 },
  pickupLocation,
];
// Onde o mapa deve focar quando abre
const initialRegion = {
  latitude: -18.5900,
  longitude: -46.5155,
  latitudeDelta: 0.005, // Nível de zoom
  longitudeDelta: 0.005, // Nível de zoom
};
// --- Fim da Simulação ---

export default function HomeScreen() {
  // Criamos uma "referência" para o mapa, para poder controlá-lo (ex: centralizar)
  const mapRef = useRef<MapView>(null);

  // Função para o botão "Centralizar"
  const handleCentralizar = () => {
    // Anima o mapa de volta para a posição do usuário
    mapRef.current?.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000); // Anima por 1 segundo
  };

  // Função para o botão "Cheguei no Local"
  const handleCheguei = () => {
    Alert.alert('Chegou!', 'O cliente foi notificado.');
    // No futuro, você pode navegar para a próxima tela
    // router.push('/coletar-item'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* O Componente do Mapa */}
        <MapView
          ref={mapRef} 
          style={styles.map}
          initialRegion={initialRegion}
          provider="google" // Diz ao 'react-native-maps' para usar a API do Google
        >
          {/* Marcador do Entregador (Ponto Azul) */}
          <Marker coordinate={userLocation}>
            <View style={styles.userMarker}>
              <FontAwesome name="location-arrow" size={20} color="white" style={styles.userMarkerIcon} />
            </View>
          </Marker>

          {/* Marcador do Ponto A (Destino) */}
          <Marker coordinate={pickupLocation}>
            <View style={styles.pickupMarker}>
              <Text style={styles.markerText}>A</Text>
            </View>
          </Marker>
          
          {/* A Linha da Rota */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#004D61" // Cor Azul Rydex
            strokeWidth={6}
          />
        </MapView>
        
        {/* =================================== */}
        {/* Camada de UI (Botões sobre o mapa) */}
        {/* =================================== */}

        {/* Banner de Instrução Superior */}
        <View style={styles.topBanner}>
          <Text style={styles.topBannerText}>Vire à esquerda em 40m</Text>
          <AntDesign name="arrowleft" size={24} color="black" />
        </View>

        {/* Botões de Ação na Direita */}
        <View style={styles.sideButtonsContainer}>
          <TouchableOpacity style={styles.sideButton}>
            <MaterialCommunityIcons name="compass" size={28} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <FontAwesome name="search" size={24} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <MaterialCommunityIcons name="volume-off" size={28} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sideButton, { backgroundColor: '#FFFAB8' }]}>
            <MaterialIcons name="warning" size={28} color="#E6A100" />
          </TouchableOpacity>
        </View>

        {/* Botão de Centralizar (Esquerda) */}
        <TouchableOpacity style={styles.centralizarButton} onPress={handleCentralizar}>
          <MaterialIcons name="my-location" size={20} color="white" />
          <Text style={styles.centralizarText}>Centralizar</Text>
        </TouchableOpacity>

        {/* Botão Inferior "Cheguei no Local" */}
        <TouchableOpacity style={styles.chegueiButton} onPress={handleCheguei}>
          <Text style={styles.chegueiButtonText}>CHEGUEI NO LOCAL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (Usando StyleSheet e Posição Absoluta)
// ===============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fundo branco
  },
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Faz o mapa preencher a tela inteira
  },
  // Marcador do Usuário (Ponto Azul)
  userMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB', // Azul
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  userMarkerIcon: {
    transform: [{ rotate: '-45deg' }], // Aponta na direção
  },
  // Marcador do Ponto A (Vermelho)
  pickupMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E74C3C', // Vermelho
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Banner de Instrução (Topo)
  topBanner: {
    position: 'absolute', // Flutua sobre o mapa
    top: 60, // Posição (ajuste para Safe Area)
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30, // Arredondado
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  topBannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // Botões Laterais (Direita)
  sideButtonsContainer: {
    position: 'absolute',
    top: 140, // Abaixo do banner
    right: 20,
    gap: 12, // Espaço entre os botões
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  // Botão Centralizar (Esquerda)
  centralizarButton: {
    position: 'absolute',
    bottom: 120, // Posição acima do botão "Cheguei"
    left: 20,
    backgroundColor: '#004D61', // Azul Rydex
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  centralizarText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Botão "Cheguei no Local"
  chegueiButton: {
    position: 'absolute',
    bottom: 30, // Posição na base
    alignSelf: 'center', // Centraliza horizontalmente
    width: '60%',
    minWidth: 250,
    paddingVertical: 18,
    backgroundColor: '#2C2C2C', // Cinza Escuro Rydex
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  chegueiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});