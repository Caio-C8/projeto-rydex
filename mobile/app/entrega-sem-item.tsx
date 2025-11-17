import React, { useRef } from 'react';
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

// --- Coordenadas de Simulação (Idênticas) ---
const userLocation = { latitude: -18.5895, longitude: -46.5135 }; 
const pickupLocation = { latitude: -18.5900, longitude: -46.5180 }; 
const routeCoordinates = [
  userLocation, { latitude: -18.5898, longitude: -46.5145 },
  { latitude: -18.5910, longitude: -46.5150 }, { latitude: -18.5905, longitude: -46.5175 },
  pickupLocation,
];
const initialRegion = {
  latitude: -18.5900, longitude: -46.5155,
  latitudeDelta: 0.005, longitudeDelta: 0.005,
};
// --- Fim da Simulação ---

// Mudei o nome da função (opcional, mas bom para organizar)
export default function CorridaEntregaFinalScreen() { 
  const mapRef = useRef<MapView>(null);

  const handleCentralizar = () => {
    mapRef.current?.animateToRegion({
      ...userLocation, latitudeDelta: 0.005, longitudeDelta: 0.005,
    }, 1000); 
  };

  // ===================================
  // MUDANÇA 1: NOME DA FUNÇÃO E ALERTA
  // ===================================
  // Função para o botão "ENTREGA FINALIZADA"
  const handleFinalizarEntrega = () => {
    Alert.alert('Entrega Finalizada!', 'A entrega foi concluída com sucesso.');
    // No futuro, você pode navegar de volta para a home:
    // router.push('/(tabs)/'); 
  };
  // ===================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          ref={mapRef} 
          style={styles.map}
          initialRegion={initialRegion}
          provider="google" 
        >
          {/* ... (Marcadores e Polyline continuam iguais) ... */}
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
          <Polyline coordinates={routeCoordinates} strokeColor="#004D61" strokeWidth={6} />
        </MapView>
        
        {/* ... (UI do Mapa continua igual) ... */}
        <View style={styles.topBanner}>
          <Text style={styles.topBannerText}>Vire à esquerda em 40m</Text>
          <AntDesign name="arrowleft" size={24} color="black" />
        </View>
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
        <TouchableOpacity style={styles.centralizarButton} onPress={handleCentralizar}>
          <MaterialIcons name="my-location" size={20} color="white" />
          <Text style={styles.centralizarText}>Centralizar</Text>
        </TouchableOpacity>

        {/* =================================== */}
        {/* MUDANÇA 2: TEXTO DO BOTÃO E ONPRESS */}
        {/* =================================== */}
        <TouchableOpacity style={styles.chegueiButton} onPress={handleFinalizarEntrega}>
          <Text style={styles.chegueiButtonText}>ENTREGA FINALIZADA</Text>
        </TouchableOpacity>
        {/* =================================== */}

      </View>
    </SafeAreaView>
  );
}

// ===============================================
// ESTILOS (Idênticos ao arquivo anterior)
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