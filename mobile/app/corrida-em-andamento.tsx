import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { router } from 'expo-router';
import { FontAwesome, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';

// 1. Importe o tema (para garantir consistência)
import { Colors } from '../constants/theme';

// --- Coordenadas de Simulação ---
const userLocation = { latitude: -18.5895, longitude: -46.5135 }; 
const pickupLocation = { latitude: -18.5900, longitude: -46.5180 }; 
const routeCoordinates = [
  userLocation, 
  { latitude: -18.5898, longitude: -46.5145 },
  { latitude: -18.5910, longitude: -46.5150 }, 
  { latitude: -18.5905, longitude: -46.5175 },
  pickupLocation,
];
const initialRegion = {
  latitude: -18.5900, longitude: -46.5155,
  latitudeDelta: 0.005, longitudeDelta: 0.005,
};

export default function CorridaEmAndamentoScreen() {
  const mapRef = useRef<MapView>(null);
  const [realRoute, setRealRoute] = useState<any[]>([]);

  // Função para buscar a rota real do Google (se tiver API Key)
  useEffect(() => {
    const fetchRoute = async () => {
      // Se não tiver chave configurada no .env, ele vai usar a rota simulada (routeCoordinates)
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return;

      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${pickupLocation.latitude},${pickupLocation.longitude}`;
      
      try {
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
        );
        const respJson = await resp.json();
        
        if (respJson.routes.length) {
          const points = polyline.decode(respJson.routes[0].overview_polyline.points);
          const coords = points.map((point) => ({
            latitude: point[0],
            longitude: point[1]
          }));
          setRealRoute(coords);
        }
      } catch (error) {
        console.error("Erro ao buscar rota", error);
      }
    };
    fetchRoute();
  }, []);

  const handleCentralizar = () => {
    mapRef.current?.animateToRegion({
      ...userLocation, latitudeDelta: 0.005, longitudeDelta: 0.005,
    }, 1000); 
  };

  const handleCheguei = () => {
    // Alert.alert('Chegou!', 'O cliente foi notificado.');
    // Navega para a próxima etapa (Entrega Final)
    router.push('/corrida-entrega-final'); 
  };

  // Força tema claro para esta tela também, para evitar bugs visuais
  const themeColors = Colors['light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <View style={styles.container}>
        <MapView
          ref={mapRef} 
          style={styles.map}
          initialRegion={initialRegion}
          provider="google" 
        >
          <Marker coordinate={userLocation}>
            <View style={styles.userMarker}>
              <FontAwesome name="location-arrow" size={20} color="white" style={styles.userMarkerIcon} />
            </View>
          </Marker>
          <Marker coordinate={pickupLocation}>
            <View style={styles.pickupMarker}>
              <Text style={styles.markerText}>A</Text>
            </View>
          </Marker>
          
          {/* Usa a rota real se tiver, senão usa a simulada */}
          <Polyline 
            coordinates={realRoute.length > 0 ? realRoute : routeCoordinates} 
            strokeColor="#004D61" 
            strokeWidth={6} 
          />
        </MapView>
        
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
// ESTILOS
// ===============================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  userMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center', borderColor: 'white', borderWidth: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 4 },
  userMarkerIcon: { transform: [{ rotate: '-45deg' }] },
  pickupMarker: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center', borderColor: 'white', borderWidth: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 4 },
  markerText: { color: 'white', fontWeight: 'bold' },
  topBanner: { position: 'absolute', top: 60, left: 20, right: 20, height: 60, backgroundColor: 'white', borderRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  topBannerText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sideButtonsContainer: { position: 'absolute', top: 140, right: 20, gap: 12 },
  sideButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  centralizarButton: { position: 'absolute', bottom: 120, left: 20, backgroundColor: '#004D61', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  centralizarText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  chegueiButton: { position: 'absolute', bottom: 30, alignSelf: 'center', width: '60%', minWidth: 250, paddingVertical: 18, backgroundColor: '#2C2C2C', borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  chegueiButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});