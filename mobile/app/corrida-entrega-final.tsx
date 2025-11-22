import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import { FontAwesome, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; 

// Importando o Tema
import { Colors, Fonts, FontSizes, verticalScale, horizontalScale, moderateScale } from '../constants/theme';

// --- Coordenadas de Simulação ---
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

export default function CorridaEntregaFinalScreen() { 
  const mapRef = useRef<MapView>(null);
  // Força o tema claro
  const themeColors = Colors['light']; 

  const handleCentralizar = () => {
    mapRef.current?.animateToRegion({
      ...userLocation, latitudeDelta: 0.005, longitudeDelta: 0.005,
    }, 1000); 
  };

  const handleFinalizarEntrega = () => {
    Alert.alert('Entrega Concluída', 'Iniciando rota de retorno...');
    // Navega para a tela de retorno
    router.push('/corrida-retorno'); 
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <View style={styles.container}>
        <MapView
          ref={mapRef} 
          style={styles.map}
          initialRegion={initialRegion}
          provider={PROVIDER_GOOGLE} 
        >
          <Marker coordinate={userLocation}>
            <View style={styles.userMarker}>
              <FontAwesome name="location-arrow" size={moderateScale(20)} color="white" style={styles.userMarkerIcon} />
            </View>
          </Marker>
          <Marker coordinate={pickupLocation}>
            <View style={styles.pickupMarker}>
              <Text style={styles.markerText}>A</Text>
            </View>
          </Marker>
          <Polyline coordinates={routeCoordinates} strokeColor={themeColors.rydexBlue} strokeWidth={6} />
        </MapView>
        
        {/* Banner Superior */}
        <View style={styles.topBanner}>
          <Text style={styles.topBannerText}>Vire à esquerda em 40m</Text>
          <AntDesign name="arrowleft" size={moderateScale(24)} color="black" />
        </View>

        {/* Botões Laterais */}
        <View style={styles.sideButtonsContainer}>
          <TouchableOpacity style={styles.sideButton}>
            <MaterialCommunityIcons name="compass" size={moderateScale(28)} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <FontAwesome name="search" size={moderateScale(24)} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <MaterialCommunityIcons name="volume-off" size={moderateScale(28)} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sideButton, { backgroundColor: '#FFFAB8' }]}>
            <MaterialIcons name="warning" size={moderateScale(28)} color="#E6A100" />
          </TouchableOpacity>
        </View>

        {/* Botão Centralizar */}
        <TouchableOpacity style={[styles.centralizarButton, { backgroundColor: themeColors.rydexBlue }]} onPress={handleCentralizar}>
          <MaterialIcons name="my-location" size={moderateScale(20)} color="white" />
          <Text style={styles.centralizarText}>Centralizar</Text>
        </TouchableOpacity>

        {/* Botão Principal */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColors.rydexGray }]} onPress={handleFinalizarEntrega}>
          <Text style={styles.mainButtonText}>ENTREGA FINALIZADA</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  userMarker: { 
    width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(16), 
    backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center', 
    borderColor: 'white', borderWidth: 2, elevation: 4 
  },
  userMarkerIcon: { transform: [{ rotate: '-45deg' }] },
  pickupMarker: { 
    width: moderateScale(28), height: moderateScale(28), borderRadius: moderateScale(14), 
    backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center', 
    borderColor: 'white', borderWidth: 2, elevation: 4 
  },
  markerText: { color: 'white', fontWeight: 'bold', fontFamily: Fonts.sans },
  topBanner: { 
    position: 'absolute', top: verticalScale(60), left: horizontalScale(20), right: horizontalScale(20), 
    height: verticalScale(60), backgroundColor: 'white', borderRadius: 30, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: horizontalScale(20), elevation: 5 
  },
  topBannerText: { fontSize: FontSizes.subtitle, fontWeight: 'bold', color: '#333', fontFamily: Fonts.sans },
  sideButtonsContainer: { position: 'absolute', top: verticalScale(140), right: horizontalScale(20), gap: verticalScale(12) },
  sideButton: { 
    width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(25), 
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 3 
  },
  centralizarButton: { 
    position: 'absolute', bottom: verticalScale(120), left: horizontalScale(20), 
    borderRadius: 25, paddingVertical: verticalScale(10), paddingHorizontal: horizontalScale(16), 
    flexDirection: 'row', alignItems: 'center', elevation: 3 
  },
  centralizarText: { color: 'white', fontWeight: 'bold', marginLeft: horizontalScale(8), fontFamily: Fonts.sans },
  mainButton: { 
    position: 'absolute', bottom: verticalScale(30), alignSelf: 'center', 
    width: '70%', minWidth: horizontalScale(250), paddingVertical: verticalScale(18), 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 
  },
  mainButtonText: { color: 'white', fontSize: FontSizes.body, fontWeight: 'bold', fontFamily: Fonts.sans },
});