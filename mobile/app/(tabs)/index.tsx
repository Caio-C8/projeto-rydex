import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Dimensions,
    Switch,
    Platform,
    Alert,
    UIManager,
    LayoutAnimation
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';


// Habilita LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ========================================================================
// --- LÓGICA DE ESCALA E CONSTANTES ---
// ========================================================================
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size) => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = (size) => (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;
const TAB_BAR_HEIGHT = verticalScale(80); // Altura estimada da TabBar

const COLORS = {
    background: "#f4f5f7", white: "#fff", textPrimary: "#2d3436", textSecondary: "#636e72",
    textMuted: "#b2bec3", primary: "#ff8c00", border: "#dfe6e9", shadow: '#a0a0a0',
    success: '#2ecc71', danger: '#e74c3c', online: '#2ecc71', offline: '#e74c3c',
    mapBlue: '#3498db',
};
const SPACING = {
    xsmall: moderateScale(4), small: moderateScale(8), medium: moderateScale(16),
    large: moderateScale(24), xlarge: moderateScale(32),
};
const FONT_SIZES = {
    xsmall: moderateScale(10), small: moderateScale(12), medium: moderateScale(14),
    large: moderateScale(18), xlarge: moderateScale(32),
};
const BORDERS = {
    radiusSmall: moderateScale(10), radiusMedium: moderateScale(20), radiusPill: 50,
};

// ========================================================================
// --- ESTADOS POSSÍVEIS E MOCK DATA ---
// ========================================================================
type AppMode = | 'OFFLINE' | 'IDLE_ONLINE' | 'SOLICITATION' | 'EN_ROUTE_PICKUP' | 'EN_ROUTE_DELIVERY' | 'DELIVERY_FINISHED';
const mockSolicitation = { 
    id: '#857', pickupAddress: 'Rua Flores Pereira, 123', deliveryAddress: 'Av. Brasil, 456',
    value: 12.50, storeName: 'Farmácia XYZ', timer: 30,
    // CORRIGIDO: Adicionado coordenadas de exemplo
    routeToPickup: [ 
        { latitude: -18.579, longitude: -46.51 }, 
        { latitude: -18.582, longitude: -46.515 }
    ],
};
const mockDeliveryRoute = [ 
    // CORRIGIDO: Adicionado coordenadas de exemplo
    { latitude: -18.582, longitude: -46.515 }, 
    { latitude: -18.585, longitude: -46.520 } 
];

// ========================================================================
// --- COMPONENTE PRINCIPAL ---
// ========================================================================
const HomeScreen: React.FC = () => {

    // --- ESTADOS NORMAIS (RESTAURADOS) ---
    const [appMode, setAppMode] = useState<AppMode>('OFFLINE'); // << Começa OFFLINE
    const [isOnline, setIsOnline] = useState(false);            // << Começa OFFLINE
    const [solicitation, setSolicitation] = useState(null);
    const [timer, setTimer] = useState(30);
    const [region, setRegion] = useState<Region>({             // << Região inicial padrão
        latitude: -18.5792, // Patos de Minas
        longitude: -46.5176,
        latitudeDelta: 0.02,
        longitudeDelta: 0.01
    });
    const [routeCoords, setRouteCoords] = useState([]);
    const [navInstruction, setNavInstruction] = useState('');
    const mapRef = useRef<MapView>(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    // --- FIM DOS ESTADOS NORMAIS ---


    // --- useEffect para Localização ---
    useEffect(() => {
        let isMounted = true;
        const startLocationTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (isMounted) {
                    setErrorMsg('Permissão de localização negada.');
                    Alert.alert("Permissão Negada", "Habilite a localização nas configurações.");
                }
                return;
            }
            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                if (isMounted) {
                    setLocation(currentLocation);
                    const initialMapRegion = {
                        latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude,
                        latitudeDelta: 0.01, longitudeDelta: 0.005,
                    };
                    setRegion(initialMapRegion); // Define a região inicial baseada no GPS
                    mapRef.current?.animateToRegion(initialMapRegion, 1000);
                }
            } catch (error) { if (isMounted) setErrorMsg("Erro ao obter localização."); console.error(error); }

            locationSubscription.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
                (newLocation) => {
                    if (isMounted) {
                        setLocation(newLocation);
                        // Opcional: Animar mapa para seguir (só se ocioso)
                        // if (appMode === 'IDLE_ONLINE' || appMode === 'OFFLINE') {
                        //     mapRef.current?.animateCamera({ center: newLocation.coords }, { duration: 1000 });
                        // }
                    }
                }
            );
        };
        startLocationTracking();
        return () => { isMounted = false; locationSubscription.current?.remove(); };
    }, []); // Array vazio garante que rode só uma vez

    // --- useEffect para Timer da Solicitação ---
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (appMode === 'SOLICITATION' && solicitation) {
            setTimer(solicitation.timer);
            intervalId = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) { clearInterval(intervalId!); handleRejectSolicitation(); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } else if (intervalId) { clearInterval(intervalId); }
        return () => { if (intervalId) clearInterval(intervalId); };
    }, [appMode, solicitation]);

    // --- Funções de Ação ---
    const handleToggleOnline = () => { setIsOnline(!isOnline); setAppMode(!isOnline ? 'IDLE_ONLINE' : 'OFFLINE'); };
    const simulateReceiveSolicitation = () => {
        if (isOnline) {
            setSolicitation(mockSolicitation); setRouteCoords(mockSolicitation.routeToPickup); setAppMode('SOLICITATION');
            if (mapRef.current && mockSolicitation.routeToPickup.length > 0) { mapRef.current.fitToCoordinates(mockSolicitation.routeToPickup, { edgePadding: { top: 50, right: 50, bottom: 250, left: 50 }, animated: true }); }
        } else { Alert.alert("Offline", "Você precisa estar online para receber solicitações."); }
    };
    const handleAcceptSolicitation = () => { setNavInstruction('Vire à esquerda em 150m'); setAppMode('EN_ROUTE_PICKUP'); };
    const handleRejectSolicitation = () => { setSolicitation(null); setRouteCoords([]); setTimer(30); setAppMode('IDLE_ONLINE'); };
    const handleArrivedPickup = () => { setNavInstruction('Aguardando coleta...'); setTimeout(() => handleStartDelivery(), 3000); };
    const handleStartDelivery = () => {
         setNavInstruction('Vire à direita na próxima rua'); setRouteCoords(mockDeliveryRoute); setAppMode('EN_ROUTE_DELIVERY');
         if (mapRef.current && mockDeliveryRoute.length > 0) { mapRef.current.fitToCoordinates(mockDeliveryRoute, { edgePadding: { top: 50, right: 50, bottom: 150, left: 50 }, animated: true }); }
    };
    const handleArrivedDelivery = () => { setNavInstruction('Entregar o pedido'); };
    const handleFinishDelivery = () => { setNavInstruction(''); setSolicitation(null); setRouteCoords([]); setAppMode('DELIVERY_FINISHED'); setTimeout(() => setAppMode('IDLE_ONLINE'), 3000); };
    const handleCancelDelivery = () => { setNavInstruction(''); setSolicitation(null); setRouteCoords([]); setAppMode('IDLE_ONLINE'); Alert.alert("Entrega Cancelada"); };
    const toggleSummaryExpansion = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsSummaryExpanded(!isSummaryExpanded); };

    // --- Renderização Condicional ---
    const renderTopStatus = () => {
        if (errorMsg) { return ( <View style={[styles.topStatusContainer, styles.offlineBg]}><Ionicons name="warning-outline" size={moderateScale(24)} color={COLORS.danger} style={{ marginRight: SPACING.medium }}/><Text style={styles.errorText}>{errorMsg}</Text></View> ); }
        if (appMode === 'OFFLINE' || appMode === 'IDLE_ONLINE') {
            const isOnlineMode = appMode === 'IDLE_ONLINE';
            return (
                <View style={[styles.topStatusContainer, isOnlineMode ? styles.onlineBg : styles.offlineBg]}>
                    <View style={[styles.profileIconCircle, { borderColor: isOnlineMode ? COLORS.online : COLORS.offline }]}><Ionicons name="person" size={moderateScale(24)} color={isOnlineMode ? COLORS.online : COLORS.offline} /></View>
                    <View style={styles.statusTextContainer}>
                        <Text style={[styles.statusTitle, { color: isOnlineMode ? COLORS.online : COLORS.offline }]}>{isOnlineMode ? 'Online' : 'Offline'}</Text>
                        <Text style={styles.statusSubtitle} numberOfLines={2}>{isOnlineMode ? 'Solicitações chegarão a qualquer momento' : 'Fique ONLINE para receber solicitações'}</Text>
                    </View>
                    <Switch trackColor={{ false: COLORS.border, true: COLORS.online }} thumbColor={COLORS.white} ios_backgroundColor={COLORS.border} onValueChange={handleToggleOnline} value={isOnline} />
                </View>
            );
        }
        if (appMode === 'EN_ROUTE_PICKUP' || appMode === 'EN_ROUTE_DELIVERY') {
             return (
                 <View style={styles.navInstructionContainer}>
                     <Ionicons name="navigate-circle-outline" size={moderateScale(20)} color={COLORS.white} style={{ marginRight: SPACING.small }}/>
                     <Text style={styles.navInstructionText} numberOfLines={1}>{navInstruction || 'Calculando rota...'}</Text>
                     <TouchableOpacity style={styles.recenterButton} onPress={() => mapRef.current?.animateToRegion(region, 500)}><Ionicons name="locate-outline" size={moderateScale(24)} color={COLORS.textPrimary} /></TouchableOpacity>
                 </View>
             );
        }
        return null;
    };

    const renderBottomCard = () => {
        if (appMode === 'SOLICITATION' && solicitation) {
             return ( <View style={[styles.bottomCardBase, styles.solicitationCard]}> {/* ... Conteúdo Solicitação ... */} </View> );
        }
        if (appMode === 'EN_ROUTE_PICKUP' || appMode === 'EN_ROUTE_DELIVERY' || appMode === 'DELIVERY_FINISHED' || navInstruction === 'Entregar o pedido') {
            let button1, button2;
            if (appMode === 'EN_ROUTE_PICKUP') { button1 = <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleArrivedPickup}><Text style={styles.actionButtonText}>CHEGUEI NA EMPRESA</Text></TouchableOpacity>; button2 = <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelDelivery}><Text style={styles.cancelButtonText}>CANCELAR</Text></TouchableOpacity>; }
            else if (appMode === 'EN_ROUTE_DELIVERY') { button1 = <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleArrivedDelivery}><Text style={styles.actionButtonText}>CHEGUEI NO LOCAL</Text></TouchableOpacity>; button2 = <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelDelivery}><Text style={styles.cancelButtonText}>CANCELAR</Text></TouchableOpacity>; }
            else if (navInstruction === 'Entregar o pedido') { button1 = <TouchableOpacity style={[styles.actionButton, styles.finishButton]} onPress={handleFinishDelivery}><Text style={styles.actionButtonText}>ENTREGA FINALIZADA</Text></TouchableOpacity>; }
            else if (appMode === 'DELIVERY_FINISHED') { button1 = <Text style={styles.finishedText}>ENTREGA FINALIZADA</Text>; }
            return ( <View style={[styles.bottomCardBase, styles.deliveryActionsContainer]}>{button1}{button2}</View> );
        }
        if (appMode === 'OFFLINE') {
             return (
                 <View style={[styles.bottomCardBase, styles.summaryCard]}>
                     <View style={styles.summaryHeader}>
                         <Text style={styles.summaryTitle}>Seus ganhos</Text>
                         <TouchableOpacity onPress={toggleSummaryExpansion}>
                             <Text style={styles.viewMoreText}>{isSummaryExpanded ? "VER MENOS" : "VER MAIS"}</Text>
                         </TouchableOpacity>
                     </View>
                     {isSummaryExpanded && (
                        <>
                             <Text style={styles.earningsText}>R$ 20,00</Text>
                             <Text style={styles.earningsLabel}>Entregas do dia</Text>
                             <View style={styles.statsContainer}>
                                <View style={styles.statItem}><Text style={styles.statValue}>2</Text><Text style={styles.statLabel}>Rotas Aceitas</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>1</Text><Text style={styles.statLabel}>Finalizadas</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Recusadas</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>1</Text><Text style={styles.statLabel}>Canceladas</Text></View>
                             </View>
                        </>
                     )}
                 </View>
             );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={isOnline ? COLORS.online : COLORS.offline} />
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef} provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFillObject}
                    region={region} showsUserLocation={true} showsMyLocationButton={false}
                    onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                    mapPadding={{ top: verticalScale(100), right: 0, bottom: verticalScale(100 + TAB_BAR_HEIGHT), left: 0 }}
                >
                      {routeCoords.length > 0 && ( <Polyline coordinates={routeCoords} strokeColor={COLORS.mapBlue} strokeWidth={4} /> )}
                      {solicitation && appMode !== 'IDLE_ONLINE' && appMode !== 'OFFLINE' && (
                          <>
                              {routeCoords.length > 0 && <Marker coordinate={routeCoords[0]} title="Coleta" pinColor="orange" />}
                              {routeCoords.length > 0 && <Marker coordinate={routeCoords[routeCoords.length - 1]} title="Entrega" pinColor="green" />}
                          </>
                      )}
                </MapView>
                {renderTopStatus()}
                {(appMode === 'IDLE_ONLINE' || appMode === 'OFFLINE') && !isSummaryExpanded && (
                    <TouchableOpacity style={styles.floatingButton} onPress={simulateReceiveSolicitation}>
                         <Ionicons name="paper-plane" size={moderateScale(24)} color={COLORS.white} />
                    </TouchableOpacity>
                )}
                 <TouchableOpacity
                     style={styles.recenterGpsButton}
                     onPress={() => { if (location && mapRef.current) { mapRef.current.animateCamera({ center: location.coords }, { duration: 1000 }); } }}
                 >
                     <Ionicons name="navigate" size={moderateScale(24)} color={COLORS.primary} />
                 </TouchableOpacity>
            </View>
            {renderBottomCard()}
        </SafeAreaView>
    );
};

export default HomeScreen;

// ========================================================================
// --- ESTILOS REFINADOS ---
// ========================================================================
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    mapContainer: { flex: 1, backgroundColor: COLORS.textMuted },
    topStatusContainer: {
        position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight + verticalScale(10) : verticalScale(50),
        left: horizontalScale(15), right: horizontalScale(15), flexDirection: 'row', alignItems: 'center',
        padding: SPACING.medium, borderRadius: BORDERS.radiusMedium, elevation: 5, shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5,
    },
    onlineBg: { backgroundColor: COLORS.white },
    offlineBg: { backgroundColor: '#ffebee' },
    profileIconCircle: {
        width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
        backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
        marginRight: SPACING.medium, borderWidth: 2,
    },
    statusTextContainer: { flex: 1, marginRight: SPACING.small },
    statusTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold' },
    statusSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, flexWrap: 'wrap', marginTop: SPACING.xsmall },
    errorText: { color: COLORS.danger, fontSize: FONT_SIZES.small, flex: 1 },
    navInstructionContainer: {
        position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight + verticalScale(10) : verticalScale(50),
        left: horizontalScale(15), right: horizontalScale(15), backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: SPACING.small, paddingHorizontal: SPACING.medium, borderRadius: BORDERS.radiusSmall,
        flexDirection: 'row', alignItems: 'center',
    },
    navInstructionText: { color: COLORS.white, fontSize: FONT_SIZES.medium, flex: 1, marginRight: SPACING.small },
    recenterButton: { padding: SPACING.xsmall, backgroundColor: COLORS.white, borderRadius: 50},
    floatingButton: {
         position: 'absolute', bottom: TAB_BAR_HEIGHT + verticalScale(100) + SPACING.medium,
         right: horizontalScale(20), backgroundColor: COLORS.primary, width: moderateScale(50), height: moderateScale(50),
         borderRadius: moderateScale(25), justifyContent: 'center', alignItems: 'center',
         elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 3,
     },
     recenterGpsButton: {
        position: 'absolute', bottom: TAB_BAR_HEIGHT + verticalScale(100) + SPACING.medium,
        left: horizontalScale(20), backgroundColor: COLORS.white, width: moderateScale(45), height: moderateScale(45),
        borderRadius: moderateScale(25), justifyContent: 'center', alignItems: 'center',
        elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
     },
    bottomCardBase: {
        position: 'absolute', bottom: TAB_BAR_HEIGHT + verticalScale(5),
        left: horizontalScale(10), right: horizontalScale(10), backgroundColor: COLORS.white,
        borderRadius: BORDERS.radiusMedium, padding: SPACING.medium,
        elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6,
    },
    summaryCard: { },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium },
    summaryTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textPrimary },
    viewMoreText: { fontSize: FONT_SIZES.small, color: COLORS.primary, fontWeight: 'bold' },
    earningsText: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.small, marginTop: SPACING.small, textAlign: 'left' },
    earningsLabel: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: SPACING.large, textAlign: 'left' },
    statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statItem: { width: '48%', alignItems: 'flex-start', marginBottom: SPACING.medium },
    statValue: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xsmall },
    statLabel: { fontSize: FONT_SIZES.xsmall, color: COLORS.textSecondary, textAlign: 'left' },

    solicitationCard: { paddingBottom: SPACING.xlarge },
    timerContainer: { position: 'absolute', top: -moderateScale(25), alignSelf: 'center', alignItems: 'center' , backgroundColor: COLORS.white, borderRadius: 50, padding: SPACING.small, elevation: 11},
    timerText: { fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.danger },
    timerLabel: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginTop: -SPACING.xsmall},
    solicitationDetails: { marginTop: SPACING.medium, marginBottom: SPACING.large },
    solicitationTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xsmall},
    solicitationValue: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.success, marginBottom: SPACING.medium },
    detailLabel: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, marginBottom: SPACING.xsmall },
    detailValue: { fontSize: FONT_SIZES.medium, color: COLORS.textPrimary, marginBottom: SPACING.small },
    solicitationActions: { flexDirection: 'row', gap: SPACING.medium },
    actionButton: { flex: 1, paddingVertical: verticalScale(14), borderRadius: BORDERS.radiusSmall, alignItems: 'center' },
    acceptButton: { backgroundColor: COLORS.success },
    rejectButton: { backgroundColor: COLORS.danger },
    actionButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZES.medium },

    deliveryActionsContainer: { flexDirection: 'column', gap: SPACING.medium },
    primaryButton: { backgroundColor: COLORS.success },
    cancelButton: { backgroundColor: COLORS.border },
    cancelButtonText: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: FONT_SIZES.medium },
    finishButton: { backgroundColor: COLORS.primary },
    finishedText: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center'},
});