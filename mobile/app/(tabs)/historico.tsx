import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  useColorScheme, // 1. Importado
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// 2. Importado do seu novo theme.ts (subindo dois níveis: ../../)
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale, moderateScale } from '../../constants/theme';

// ========================================================================
// --- MOCK DATA E INTERFACES (Permanece igual) ---
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
interface HistoryCardProps { 
  delivery: Delivery; 
  themeColors: typeof Colors.light; // 3. Precisa receber as cores
}

const HistoryCard: React.FC<HistoryCardProps> = ({ delivery, themeColors }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define a cor do status (verde para Finalizada, cinza para outras)
  const statusColor = delivery.isFinished ? '#2ecc71' : themeColors.textGray;

  return (
    <View style={[styles.cardContainer, { backgroundColor: themeColors.background, borderColor: themeColors.lightGray }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{delivery.type} {delivery.id}</Text>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={moderateScale(24)} color={themeColors.textGray} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>Valor</Text>
        <Text style={[styles.cardValue, { color: themeColors.text }]}>R$ {delivery.value.toFixed(2).replace('.', ',')}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>Saída</Text>
        <Text style={[styles.cardValue, styles.addressText, { color: themeColors.text }]}>{delivery.departure}</Text>
      </View>
      {isExpanded && (
        <>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>Destino</Text>
            <Text style={[styles.cardValue, styles.addressText, { color: themeColors.text }]}>{delivery.destination || 'N/A'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>Retorno</Text>
            <Text style={[styles.cardValue, styles.addressText, { color: themeColors.text }]}>{delivery.returnAddress || 'N/A'}</Text>
          </View>
          {delivery.notes && (
            <View style={[styles.notesContainer, { borderColor: themeColors.lightGray }]}>
              <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>Observações</Text>
              <Text style={[styles.notesText, { color: themeColors.textGray }]}>{delivery.notes}</Text>
            </View>
          )}
        </>
      )}
        <View style={[styles.statusContainer, { borderColor: themeColors.lightGray }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {delivery.status}
          </Text>
        </View>
    </View>
  );
};

// ========================================================================
// --- COMPONENTE PRINCIPAL ---
// ========================================================================
const HistoryScreen: React.FC = () => {
  // 4. Pega o tema (light/dark) e as cores corretas
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

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
    // 5. Cor de fundo dinâmica aplicada
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.appBackground} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: themeColors.text }]}>Histórico</Text>

        {historyData.map((dayData) => {
          const isDateExpanded = expandedDates.has(dayData.date);
          return (
            <View key={dayData.date} style={styles.dateGroupContainer}>
              <TouchableOpacity onPress={() => toggleDateExpansion(dayData.date)} style={[styles.dateHeader, { backgroundColor: themeColors.background, borderColor: themeColors.lightGray }]}>
                <Text style={[styles.dateText, { color: themeColors.textGray }]}>{dayData.date}</Text>
                <View style={styles.dateHeaderRight}>
                  <Text style={[styles.totalAmountText, { color: themeColors.text }]}>R$ {dayData.totalAmount.toFixed(2).replace('.', ',')}</Text>
                  <Feather name={isDateExpanded ? 'chevron-up' : 'chevron-down'} size={moderateScale(24)} color={themeColors.textGray} />
                </View>
              </TouchableOpacity>
              {isDateExpanded && (
                <View style={styles.deliveriesList}>
                  {dayData.deliveries.map((delivery) => (
                    // 6. Passa as cores para o componente Card
                    <HistoryCard key={delivery.id} delivery={delivery} themeColors={themeColors} />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryScreen;

// ========================================================================
// --- ESTILOS (ATUALIZADOS COM ESCALA RESPONSIVA) ---
// ========================================================================
const styles = StyleSheet.create({
    safeArea: { 
      flex: 1, 
      // cor de fundo aplicada dinamicamente no JSX
    },
    container: {
        paddingBottom: verticalScale(100),
        paddingHorizontal: horizontalScale(16),
    },
    screenTitle: {
        fontSize: moderateScale(32), // Mapeado do FONT_SIZES.xlarge
        fontWeight: 'bold', 
        marginTop: verticalScale(50),
        marginBottom: verticalScale(24),
        paddingHorizontal: horizontalScale(8),
        fontFamily: Fonts.default.sans,
    },
    dateGroupContainer: { 
      marginBottom: verticalScale(16),
    },
    dateHeader: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: verticalScale(16), 
        paddingHorizontal: horizontalScale(16),
        borderBottomWidth: 1, 
        borderRadius: 10, // Mapeado do BORDERS.radiusSmall
        elevation: 1, 
        shadowColor: "#a0a0a0", 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, 
        shadowRadius: 1,
    },
    dateHeaderRight: { 
      flexDirection: 'row', 
      alignItems: 'center',
    },
    dateText: { 
      fontSize: FontSizes.subtitle, // Mapeado do FONT_SIZES.large
      fontWeight: 'bold', 
      fontFamily: Fonts.default.sans,
    },
    totalAmountText: { 
      fontSize: FontSizes.subtitle, // Mapeado do FONT_SIZES.large
      fontWeight: 'bold', 
      marginRight: horizontalScale(16),
      fontFamily: Fonts.default.sans,
    },
    deliveriesList: { 
      marginTop: verticalScale(8),
    },
    cardContainer: {
        borderRadius: 20, // Mapeado do BORDERS.radiusMedium
        padding: horizontalScale(16), 
        marginBottom: verticalScale(16),
        elevation: 3, 
        shadowColor: "#a0a0a0", 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, 
        shadowRadius: 4,
        borderWidth: 1, // Adicionado para dark mode
    },
    cardHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: verticalScale(16),
    },
    cardTitle: { 
      fontSize: FontSizes.subtitle, // Mapeado do FONT_SIZES.large
      fontWeight: 'bold', 
      fontFamily: Fonts.default.sans,
    },
    cardRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: verticalScale(8), 
      alignItems: 'flex-start',
    },
    cardLabel: { 
      fontSize: FontSizes.caption, // Mapeado do FONT_SIZES.medium
      marginRight: horizontalScale(8), 
      minWidth: horizontalScale(60),
      fontFamily: Fonts.default.sans,
    },
    cardValue: { 
      fontSize: FontSizes.caption, // Mapeado do FONT_SIZES.medium
      fontWeight: '500', 
      flexShrink: 1, 
      textAlign: 'right',
      fontFamily: Fonts.default.sans,
    },
    addressText: { 
      textAlign: 'right',
    },
    notesContainer: { 
      marginTop: verticalScale(8), 
      paddingTop: verticalScale(8), 
      borderTopWidth: 1, 
    },
    notesText: { 
      fontSize: FontSizes.caption, // Mapeado do FONT_SIZES.medium
      marginTop: verticalScale(4), 
      lineHeight: FontSizes.caption * 1.4,
      fontFamily: Fonts.default.sans,
    },
    statusContainer: { 
      flexDirection: 'row', 
      justifyContent: 'flex-end', 
      alignItems: 'center', 
      marginTop: verticalScale(16), 
      paddingTop: verticalScale(16), 
      borderTopWidth: 1, 
    },
    statusText: { 
      fontSize: FontSizes.caption, // Mapeado do FONT_SIZES.medium
      fontWeight: 'bold', 
      marginRight: horizontalScale(8),
      fontFamily: Fonts.default.sans,
    },
});