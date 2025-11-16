import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Switch
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

// ========================================================================
// --- 1. LÓGICA DE ESCALA PROFISSIONAL ---
// ========================================================================
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size) => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = (size) => (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;

// ========================================================================
// --- 2. CONSTANTES DE ESTILO (TEMA) ---
// ========================================================================
const COLORS = {
  background: "#f4f5f7", white: "#fff", textPrimary: "#2d3436",
  textSecondary: "#636e72", textMuted: "#b2bec3", primary: "#ff8c00",
  border: "#dfe6e9", shadow: '#a0a0a0', success: '#2ecc71', // Verde mais vivo para status
  lightGrey: '#f9f9f9',
};
const SPACING = {
  xsmall: moderateScale(4), small: moderateScale(8), medium: moderateScale(16),
  large: moderateScale(24),
};
const FONT_SIZES = {
  small: moderateScale(12), medium: moderateScale(14), large: moderateScale(16),
  xlarge: moderateScale(32),
};
const BORDERS = {
  radiusSmall: moderateScale(8), radiusMedium: moderateScale(16),
};

// ========================================================================
// --- MOCK DATA E INTERFACES ---
// ========================================================================
const historyData = [
  {
    date: '09/09/25', totalAmount: 20.00,
    deliveries: [
      { id: '#354', type: 'Entrega', value: 20.00, departure: 'Rua alguma coisa, 12', destination: 'Rua alguma coisa, 12', returnAddress: 'Rua outra coisa, 512', notes: '1x Máquina de cartão de crédito', status: 'Finalizada', isFinished: true },
      { id: '#355', type: 'Entrega', value: 15.50, departure: 'Av. Brasil, 1000', destination: 'Rua Teste, 45', returnAddress: 'Av. Brasil, 1000', notes: '2x Lanches\n1x Refrigerante', status: 'Pendente', isFinished: false },
    ],
  },
  {
    date: '08/09/25', totalAmount: 100.00,
    deliveries: [
        { id: '#350', type: 'Entrega', value: 50.00, departure: 'Centro, 1', destination: 'Bairro X, 10', returnAddress: 'Centro, 1', notes: 'Documentos urgentes', status: 'Finalizada', isFinished: true },
        { id: '#351', type: 'Entrega', value: 50.00, departure: 'Shopping, Loja Y', destination: 'Residencial Z, Bloco A', returnAddress: 'Shopping, Loja Y', notes: 'Pacote frágil', status: 'Finalizada', isFinished: true },
    ],
  },
];
interface Delivery { id: string; type: string; value: number; departure: string; destination?: string; returnAddress?: string; notes?: string; status: string; isFinished: boolean; }
interface HistoryDay { date: string; totalAmount: number; deliveries: Delivery[]; }

// ========================================================================
// --- COMPONENTES REUTILIZÁVEIS DA TELA ---
// ========================================================================
interface HistoryCardProps { delivery: Delivery; }

const HistoryCard: React.FC<HistoryCardProps> = ({ delivery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // REMOVIDO: const [isEnabled, setIsEnabled] = useState(true);
  // REMOVIDO: const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{delivery.type} {delivery.id}</Text>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={moderateScale(24)} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Valor</Text>
        <Text style={styles.cardValue}>R$ {delivery.value.toFixed(2).replace('.', ',')}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Saída</Text>
        <Text style={[styles.cardValue, styles.addressText]}>{delivery.departure}</Text>
      </View>
      {isExpanded && (
        <>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Destino</Text>
            <Text style={[styles.cardValue, styles.addressText]}>{delivery.destination || 'N/A'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Retorno</Text>
            <Text style={[styles.cardValue, styles.addressText]}>{delivery.returnAddress || 'N/A'}</Text>
          </View>
          {delivery.notes && (
            <View style={styles.notesContainer}>
                <Text style={styles.cardLabel}>Observações</Text>
                <Text style={styles.notesText}>{delivery.notes}</Text>
            </View>
          )}
        </>
      )}
        <View style={styles.statusContainer}>
          {/* O texto agora está fixo e sempre verde */}
          <Text style={[styles.statusText, { color: COLORS.success }]}>
            Finalizada
          </Text>
          {/* O componente Switch foi REMOVIDO */}
        </View>
    </View>
  );
};

// ========================================================================
// --- COMPONENTE PRINCIPAL ---
// ========================================================================
const HistoryScreen: React.FC = () => {
  // ALTERADO: Inicializa o estado com todas as datas do mock data expandidas
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set(historyData.map(day => day.date)));

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Histórico</Text>

        {historyData.map((dayData) => {
          const isDateExpanded = expandedDates.has(dayData.date);
          return (
            <View key={dayData.date} style={styles.dateGroupContainer}>
              <TouchableOpacity onPress={() => toggleDateExpansion(dayData.date)} style={styles.dateHeader}>
                <Text style={styles.dateText}>{dayData.date}</Text>
                <View style={styles.dateHeaderRight}>
                  <Text style={styles.totalAmountText}>R$ {dayData.totalAmount.toFixed(2).replace('.', ',')}</Text>
                  <Feather name={isDateExpanded ? 'chevron-up' : 'chevron-down'} size={moderateScale(24)} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
              {isDateExpanded && (
                <View style={styles.deliveriesList}>
                  {dayData.deliveries.map((delivery) => (
                    <HistoryCard key={delivery.id} delivery={delivery} />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      {/* A BARRA DE NAVEGAÇÃO É GERADA PELO _layout.tsx */}
    </SafeAreaView>
  );
};

export default HistoryScreen;

// ========================================================================
// --- ESTILOS ---
// ========================================================================
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: {
        paddingBottom: verticalScale(100),
        paddingHorizontal: SPACING.medium,
    },
    screenTitle: {
        fontSize: FONT_SIZES.xlarge, fontWeight: 'bold', color: COLORS.textPrimary,
        marginTop: verticalScale(50),
        marginBottom: SPACING.large,
        paddingHorizontal: SPACING.small,
    },
    dateGroupContainer: { marginBottom: SPACING.medium },
    dateHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: SPACING.medium, paddingHorizontal: SPACING.medium,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1, borderColor: COLORS.border,
        borderRadius: BORDERS.radiusSmall,
        elevation: 1,
        shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 1,
    },
    dateHeaderRight: { flexDirection: 'row', alignItems: 'center' },
    dateText: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textSecondary },
    totalAmountText: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textPrimary, marginRight: SPACING.medium },
    deliveriesList: { marginTop: SPACING.small },
    cardContainer: {
        backgroundColor: COLORS.white, borderRadius: BORDERS.radiusMedium,
        padding: SPACING.medium, marginBottom: SPACING.medium,
        elevation: 3, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium },
    cardTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold', color: COLORS.textPrimary },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.small, alignItems: 'flex-start' },
    cardLabel: { fontSize: FONT_SIZES.medium, color: COLORS.textSecondary, marginRight: SPACING.small, minWidth: horizontalScale(60) },
    cardValue: { fontSize: FONT_SIZES.medium, color: COLORS.textPrimary, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
    addressText: { textAlign: 'right' },
    notesContainer: { marginTop: SPACING.small, paddingTop: SPACING.small, borderTopWidth: 1, borderColor: COLORS.border },
    notesText: { fontSize: FONT_SIZES.medium, color: COLORS.textSecondary, marginTop: SPACING.xsmall, lineHeight: FONT_SIZES.medium * 1.4 },
    statusContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: SPACING.medium, paddingTop: SPACING.medium, borderTopWidth: 1, borderColor: COLORS.border },
    statusText: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', marginRight: SPACING.small },
    switch: { transform: [{ scaleX: .8 }, { scaleY: .8 }] },
});
