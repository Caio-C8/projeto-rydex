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
} from 'react-native'; // Seu import está correto!
import { Feather, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { socketService } from '../../services/socket.service';
import { NotificacaoSolicitacaoDto } from '../../types/api.types';
import { entregadoresService } from '../../services/entregadores.service';
import { entregasService } from '../../services/entregas.service';
import { tratarErroApi } from '../../utils/api-error-handler';



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
    routeToPickup: [ 
        { latitude: -18.579, longitude: -46.51 }, 
        { latitude: -18.582, longitude: -46.515 }
    ],
};
const mockDeliveryRoute = [ 
    { latitude: -18.582, longitude: -46.515 }, 
    { latitude: -18.585, longitude: -46.520 } 
];

// ========================================================================
// --- COMPONENTE PRINCIPAL ---
// ========================================================================
const HomeScreen: React.FC = () => {

    // --- ESTADOS ---
    const [appMode, setAppMode] = useState<AppMode>('OFFLINE');
    const [isOnline, setIsOnline] = useState(false);
    const [solicitation, setSolicitation] = useState(null);
    const [timer, setTimer] = useState(30);
    const [region, setRegion] = useState<Region>({ 
        latitude: -18.5792, longitude: -46.5176,
        latitudeDelta: 0.02, longitudeDelta: 0.01
    });
    const [routeCoords, setRouteCoords] = useState([]);
    const [navInstruction, setNavInstruction] = useState('');
    const mapRef = useRef<MapView>(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const [currentDeliveryId, setCurrentDeliveryId] = useState<number | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    // --- FIM DOS ESTADOS ---

const handleNovaSolicitacao = (data: NotificacaoSolicitacaoDto) => {
        console.log("🔔 Nova Solicitação Recebida:", data);

        // Formata a distância (ex: 1500m -> 1.5 km)
        const distanciaKm = (data.distancia_m / 1000).toFixed(1);

        // Mapeia os dados REAIS do socket para o visual do App
        const newSolicitation = {
            // Dados de Identificação
            id: `#${data.id}`,
            realSolicitacaoId: data.id,
            
            // Dados Financeiros
            value: data.valor_entregador / 100, // Centavos -> Reais
            
            // Dados da Empresa (Coleta)
            storeName: data.empresa.nome_empresa,
            pickupAddress: `${data.empresa.logradouro}, ${data.empresa.numero} - ${data.empresa.bairro}`,
            
            // Dados do Cliente (Entrega)
            deliveryAddress: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
            
            // Detalhes Extras
            distanceLabel: `${distanciaKm} km`,
            notes: data.observacao,
            hasReturn: data.item_retorno,
            
            timer: 30, // Contagem regressiva local
            
            // Rota para o Mapa (Da localização atual do entregador até a Empresa)
            routeToPickup: [
                { 
                    latitude: location?.coords.latitude || 0, 
                    longitude: location?.coords.longitude || 0 
                },
                { 
                    latitude: data.empresa.latitude, 
                    longitude: data.empresa.longitude 
                }
            ],
        };

        setSolicitation(newSolicitation);
        setRouteCoords(newSolicitation.routeToPickup);
        
        // Muda o modo do App para mostrar o Card de Solicitação
        setAppMode('SOLICITATION');

        // Anima o mapa para focar na rota de coleta
        if (mapRef.current && newSolicitation.routeToPickup.length > 0) {
             mapRef.current.fitToCoordinates(newSolicitation.routeToPickup, {
                 edgePadding: { top: 100, right: 50, bottom: 350, left: 50 }, // Bottom maior por causa do card
                 animated: true 
             });
        }
    };

      // --- EFEITO PARA GERENCIAR SOCKET ---
    useEffect(() => {
        // Se estiver online, conecta e escuta
        if (isOnline) {
            socketService.connect();
            
            // Ouve o evento que definiste no Gateway: .emit("nova.solicitacao", ...)
            socketService.on("nova.solicitacao", handleNovaSolicitacao);
        } else {
            // Se ficar offline, desconecta
            socketService.off("nova.solicitacao");
            socketService.disconnect();
        }

        // Cleanup ao desmontar
        return () => {
            socketService.off("nova.solicitacao");
            // Não desconectamos aqui forçadamente para manter conexão entre tabs se necessário,
            // mas se quiser desconectar ao sair da tela, descomente:
            // socketService.disconnect(); 
        };
    }, [isOnline, location]); // Dependência 'isOnline' é crucial aqui


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
                    setRegion(initialMapRegion); 
                    mapRef.current?.animateToRegion(initialMapRegion, 1000);
                }
            } catch (error) { if (isMounted) setErrorMsg("Erro ao obter localização."); console.error(error); }

            locationSubscription.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
                (newLocation) => {
                    if (isMounted) {
                        setLocation(newLocation);
                    }
                }
            );
        };
        startLocationTracking();
        return () => { isMounted = false; locationSubscription.current?.remove(); };
    }, []); 

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
const handleToggleOnline = async () => {
        if (isLoadingAction) return; // Evita clique duplo
        setIsLoadingAction(true);

        const novoStatus = !isOnline;

        try {
            if (novoStatus) {
                // 1. Tenta ficar Online na API
                await entregadoresService.statusOnline();
                
                // 2. Se deu certo, atualiza localmente
                setIsOnline(true);
                setAppMode('IDLE_ONLINE');
                
                // O socketService.connect() será chamado automaticamente pelo seu useEffect 
                // que depende de [isOnline]
                
            } else {
                // 1. Tenta ficar Offline na API
                await entregadoresService.statusOffline();
                
                // 2. Atualiza localmente
                setIsOnline(false);
                setAppMode('OFFLINE');
                setSolicitation(null); // Limpa qualquer solicitação pendente
            }
        } catch (error) {
            const msg = tratarErroApi(error);
            Alert.alert("Erro ao alterar status", msg);
            
            // Se der erro, garante que o switch visual volta ao estado anterior correto
            // (opcional, dependendo de como queres tratar a UI)
        } finally {
            setIsLoadingAction(false);
        }
    };
    const simulateReceiveSolicitation = () => {
        if (isOnline) {
            setSolicitation(mockSolicitation); setRouteCoords(mockSolicitation.routeToPickup); setAppMode('SOLICITATION');
            if (mapRef.current && mockSolicitation.routeToPickup.length > 0) { mapRef.current.fitToCoordinates(mockSolicitation.routeToPickup, { edgePadding: { top: 50, right: 50, bottom: 250, left: 50 }, animated: true }); }
        } else { Alert.alert("Offline", "Você precisa estar online para receber solicitações."); }
    };
// --- FUNÇÃO ATUALIZADA: Aceitar Solicitação ---
    const handleAcceptSolicitation = async () => {
        // Verifica se temos a solicitação e o ID real dela (vindo do socket)
        if (!solicitation || !solicitation.realSolicitacaoId) {
            Alert.alert("Erro", "Dados da solicitação inválidos.");
            return;
        }

        if (isLoadingAction) return;
        setIsLoadingAction(true);

        try {
            // 1. Chama a API para aceitar
            // O serviço retorna: { entrega: Entrega, empresaId: number }
            const resposta = await entregasService.aceitarEntrega(solicitation.realSolicitacaoId);

            // 2. Guarda o ID da nova entrega criada (importante para finalizar/cancelar depois)
            setCurrentDeliveryId(resposta.entrega.id);

            // 3. Atualiza a UI para o modo de navegação
            setNavInstruction('Dirija-se ao estabelecimento para coleta');
            setAppMode('EN_ROUTE_PICKUP');
            
            // Opcional: Fazer o mapa focar na rota novamente se necessário
            
        } catch (error) {
            const msg = tratarErroApi(error);
            Alert.alert("Não foi possível aceitar", msg);
            
            // Se falhar (ex: outro entregador pegou), volta para o estado de busca
            setSolicitation(null);
            setRouteCoords([]);
            setAppMode('IDLE_ONLINE');
        } finally {
            setIsLoadingAction(false);
        }
    };
    const handleRejectSolicitation = () => {
        setSolicitation(null);
        setRouteCoords([]);
        setTimer(30);
        setAppMode('IDLE_ONLINE');
        // O socket continuará escutando novas solicitações
    };
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
        // ===================================
        // --- CÓDIGO DO CARD FALTANTE (PREENCHIDO) ---
        // ===================================
        if (appMode === 'SOLICITATION' && solicitation) {
            return ( 
                <View style={[styles.bottomCardBase, styles.solicitationCard]}>
                    {/* Timer Flutuante */}
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>{timer}</Text>
                        <Text style={styles.timerLabel}>s</Text>
                    </View>

                    <View style={styles.solicitationDetails}>
                        {/* Cabeçalho: Nome da Loja e Valor */}
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <View style={{flex: 1}}>
                                <Text style={styles.solicitationTitle}>{solicitation.storeName}</Text>
                                <Text style={styles.distanceText}>Distância estimada: {solicitation.distanceLabel}</Text>
                            </View>
                            <Text style={styles.solicitationValue}>
                                R$ {solicitation.value.toFixed(2).replace('.', ',')}
                            </Text>
                        </View>

                        {/* Alerta de Retorno (Se houver) */}
                        {solicitation.hasReturn && (
                            <View style={styles.returnBadge}>
                                <Feather name="refresh-cw" size={12} color="#d35400" />
                                <Text style={styles.returnText}>Itens para retorno</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        {/* Endereços */}
                        <Text style={styles.detailLabel}>📍 RETIRADA</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{solicitation.pickupAddress}</Text>
                        
                        <Text style={[styles.detailLabel, { marginTop: 8 }]}>🏁 ENTREGA</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{solicitation.deliveryAddress}</Text>

                        {/* Observações (Se houver) */}
                        {solicitation.notes && (
                            <View style={styles.noteContainer}>
                                <Text style={styles.noteLabel}>Obs:</Text>
                                <Text style={styles.noteValue} numberOfLines={1}>{solicitation.notes}</Text>
                            </View>
                        )}
                    </View>

                    {/* Botões de Ação */}
                    <View style={styles.solicitationActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleRejectSolicitation}>
                            <Text style={styles.actionButtonText}>REJEITAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAcceptSolicitation}>
                            <Text style={styles.actionButtonText}>ACEITAR</Text>
                        </TouchableOpacity>
                    </View>
                </View> 
            );
        }
        // ===================================
        // --- FIM DO CÓDIGO FALTANTE ---
        // ===================================

        if (appMode === 'EN_ROUTE_PICKUP' || appMode === 'EN_ROUTE_DELIVERY' || appMode === 'DELIVERY_FINISHED' || navInstruction === 'Entregar o pedido') {
            let button1, button2;
            if (appMode === 'EN_ROUTE_PICKUP') { button1 = <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleArrivedPickup}><Text style={styles.actionButtonText}>CHEGUEI NA EMPRESA</Text></TouchableOpacity>; button2 = <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelDelivery}><Text style={styles.cancelButtonText}>CANCELAR</Text></TouchableOpacity>; }
            else if (appMode === 'EN_ROUTE_DELIVERY') { button1 = <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleArrivedDelivery}><Text style={styles.actionButtonText}>CHEGUEI NO LOCAL</Text></TouchableOpacity>; button2 = <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelDelivery}><Text style={styles.cancelButtonText}>CANCELAR</Text></TouchableOpacity>; }
            else if (navInstruction === 'Entregar o pedido') { button1 = <TouchableOpacity style={[styles.actionButton, styles.finishButton]} onPress={handleFinishDelivery}><Text style={styles.actionButtonText}>ENTREGA FINALIZADA</Text></TouchableOpacity>; }
            else if (appMode === 'DELIVERY_FINISHED') { button1 = <Text style={styles.finishedText}>ENTREGA FINALIZADA</Text>; }
            return ( <View style={[styles.bottomCardBase, styles.deliveryActionsContainer]}>{button1}{button2}</View> );
        }
        if (appMode === 'OFFLINE' || (appMode === 'IDLE_ONLINE' && isSummaryExpanded)) { // <-- Modificado para mostrar também em IDLE_ONLINE
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
                {/* Modificado para mostrar o resumo e o botão de simulação */}
                {(appMode === 'IDLE_ONLINE' && !isSummaryExpanded) && (
                    <TouchableOpacity style={styles.floatingButton} onPress={simulateReceiveSolicitation}>
                        <Ionicons name="paper-plane" size={moderateScale(24)} color={COLORS.white} />
                    </TouchableOpacity>
                )}
                {(appMode === 'IDLE_ONLINE' || appMode === 'OFFLINE') && (
                    <TouchableOpacity
                        style={styles.recenterGpsButton}
                        onPress={() => { if (location && mapRef.current) { mapRef.current.animateCamera({ center: location.coords }, { duration: 1000 }); } }}
                    >
                        <Ionicons name="navigate" size={moderateScale(24)} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
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
    distanceText: {
        fontSize: FONT_SIZES.small,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.medium,
    },
    returnBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fdebd0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    returnText: {
        fontSize: FONT_SIZES.xsmall,
        color: '#d35400',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    noteContainer: {
        flexDirection: 'row',
        marginTop: 8,
        backgroundColor: '#f8f9fa',
        padding: 6,
        borderRadius: 4,
    },
    noteLabel: {
        fontSize: FONT_SIZES.small,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginRight: 4,
    },
    noteValue: {
        fontSize: FONT_SIZES.small,
        color: COLORS.textPrimary,
        flex: 1,
    },
});