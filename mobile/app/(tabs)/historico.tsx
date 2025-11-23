import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Imports do Tema e Serviços
import {
  Colors,
  FontSizes,
  Fonts,
  verticalScale,
  horizontalScale,
  moderateScale,
} from "../../constants/theme";
import { entregasService } from "../../services/entregas.service";
import { Entrega } from "../../types/api.types";
import { tratarErroApi } from "../../utils/api-error-handler";

// ========================================================================
// --- INTERFACES PARA A TELA ---
// ========================================================================
interface DeliveryDisplay {
  id: string;
  type: string;
  value: number;
  departure: string;
  destination: string;
  returnAddress?: string;
  notes?: string;
  status: string;
  isFinished: boolean;
}

interface HistoryDay {
  date: string;
  totalAmount: number;
  deliveries: DeliveryDisplay[];
}

// ========================================================================
// --- COMPONENTES REUTILIZÁVEIS ---
// ========================================================================
interface HistoryCardProps {
  delivery: DeliveryDisplay;
  themeColors: typeof Colors.light;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ delivery, themeColors }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusColor = delivery.isFinished ? "#2ecc71" : themeColors.textGray;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: themeColors.background,
          borderColor: themeColors.lightGray,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>
          {delivery.type} {delivery.id}
        </Text>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={moderateScale(24)}
            color={themeColors.textGray}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>
          Valor
        </Text>
        <Text style={[styles.cardValue, { color: themeColors.text }]}>
          R$ {delivery.value.toFixed(2).replace(".", ",")}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>
          Saída
        </Text>
        <Text
          style={[
            styles.cardValue,
            styles.addressText,
            { color: themeColors.text },
          ]}
        >
          {delivery.departure}
        </Text>
      </View>
      {isExpanded && (
        <>
          <View style={styles.cardRow}>
            <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>
              Destino
            </Text>
            <Text
              style={[
                styles.cardValue,
                styles.addressText,
                { color: themeColors.text },
              ]}
            >
              {delivery.destination}
            </Text>
          </View>
          
          {/* Exibe observações se houver */}
          {delivery.notes && (
            <View
              style={[
                styles.notesContainer,
                { borderColor: themeColors.lightGray },
              ]}
            >
              <Text style={[styles.cardLabel, { color: themeColors.textGray }]}>
                Observações
              </Text>
              <Text style={[styles.notesText, { color: themeColors.textGray }]}>
                {delivery.notes}
              </Text>
            </View>
          )}
        </>
      )}
      <View
        style={[styles.statusContainer, { borderColor: themeColors.lightGray }]}
      >
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
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  const [historyData, setHistoryData] = useState<HistoryDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Função para agrupar entregas por data
  const processDeliveries = (entregas: Entrega[]) => {
    const groups: Record<string, HistoryDay> = {};

    entregas.forEach((entrega) => {
      // Formatar data (DD/MM/YY)
      const dateObj = new Date(entrega.criado_em);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear()).slice(-2);
      const dateKey = `${day}/${month}/${year}`;

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          totalAmount: 0,
          deliveries: [],
        };
      }

      // Valor em Reais (Backend manda centavos)
      const valueReais = entrega.valor_entrega / 100;
      groups[dateKey].totalAmount += valueReais;

      // Mapear para o formato de exibição
      groups[dateKey].deliveries.push({
        id: `#${entrega.id}`,
        type: "Entrega",
        value: valueReais,
        departure: entrega.solicitacao_entrega?.empresa?.nome_empresa || "Empresa",
        destination: `${entrega.solicitacao_entrega?.logradouro}, ${entrega.solicitacao_entrega?.numero}`,
        notes: entrega.solicitacao_entrega?.observacao || undefined,
        status: entrega.status === 'finalizada' ? "Finalizada" : 
                entrega.status === 'cancelada' ? "Cancelada" : "Em Andamento",
        isFinished: entrega.status === 'finalizada',
      });
    });

    // Converter objeto em array e ordenar por data (mais recente primeiro)
    // Assumindo que as chaves já venham ordenadas ou processando ordem reversa
    return Object.values(groups); 
  };

  const loadHistory = async () => {
    try {
      const data = await entregasService.buscarMinhasEntregas();
      const processed = processDeliveries(data);
      setHistoryData(processed);
      
      // Opcional: Expandir automaticamente o dia mais recente
      if (processed.length > 0) {
        setExpandedDates(new Set([processed[0].date]));
      }
    } catch (error) {
      console.log(tratarErroApi(error)); // Log silencioso ou Alert se preferir
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.rydexOrange} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={themeColors.appBackground}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.screenTitle, { color: themeColors.text }]}>
          Histórico
        </Text>

        {historyData.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Feather name="inbox" size={50} color={themeColors.textGray} />
            <Text style={{ color: themeColors.textGray, marginTop: 10 }}>
              Nenhuma entrega realizada ainda.
            </Text>
          </View>
        ) : (
          historyData.map((dayData) => {
            const isDateExpanded = expandedDates.has(dayData.date);
            return (
              <View key={dayData.date} style={styles.dateGroupContainer}>
                <TouchableOpacity
                  onPress={() => toggleDateExpansion(dayData.date)}
                  style={[
                    styles.dateHeader,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.lightGray,
                    },
                  ]}
                >
                  <Text
                    style={[styles.dateText, { color: themeColors.textGray }]}
                  >
                    {dayData.date}
                  </Text>
                  <View style={styles.dateHeaderRight}>
                    <Text
                      style={[
                        styles.totalAmountText,
                        { color: themeColors.text },
                      ]}
                    >
                      R$ {dayData.totalAmount.toFixed(2).replace(".", ",")}
                    </Text>
                    <Feather
                      name={isDateExpanded ? "chevron-up" : "chevron-down"}
                      size={moderateScale(24)}
                      color={themeColors.textGray}
                    />
                  </View>
                </TouchableOpacity>
                {isDateExpanded && (
                  <View style={styles.deliveriesList}>
                    {dayData.deliveries.map((delivery) => (
                      <HistoryCard
                        key={delivery.id}
                        delivery={delivery}
                        themeColors={themeColors}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryScreen;

// ========================================================================
// --- ESTILOS (Mantidos) ---
// ========================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: verticalScale(100),
    paddingHorizontal: horizontalScale(16),
  },
  screenTitle: {
    fontSize: moderateScale(32),
    fontWeight: "bold",
    marginTop: verticalScale(50),
    marginBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(8),
    fontFamily: Fonts.sans,
  },
  dateGroupContainer: {
    marginBottom: verticalScale(16),
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 1,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#a0a0a0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  dateHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: FontSizes.subtitle,
    fontWeight: "bold",
    fontFamily: Fonts.sans,
  },
  totalAmountText: {
    fontSize: FontSizes.subtitle,
    fontWeight: "bold",
    marginRight: horizontalScale(16),
    fontFamily: Fonts.sans,
  },
  deliveriesList: {
    marginTop: verticalScale(8),
  },
  cardContainer: {
    borderRadius: 20,
    padding: horizontalScale(16),
    marginBottom: verticalScale(16),
    elevation: 3,
    shadowColor: "#a0a0a0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  cardTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: "bold",
    fontFamily: Fonts.sans,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
    alignItems: "flex-start",
  },
  cardLabel: {
    fontSize: FontSizes.caption,
    marginRight: horizontalScale(8),
    minWidth: horizontalScale(60),
    fontFamily: Fonts.sans,
  },
  cardValue: {
    fontSize: FontSizes.caption,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
    fontFamily: Fonts.sans,
  },
  addressText: {
    textAlign: "right",
  },
  notesContainer: {
    marginTop: verticalScale(8),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
  },
  notesText: {
    fontSize: FontSizes.caption,
    marginTop: verticalScale(4),
    lineHeight: FontSizes.caption * 1.4,
    fontFamily: Fonts.sans,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: verticalScale(16),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
  },
  statusText: {
    fontSize: FontSizes.caption,
    fontWeight: "bold",
    marginRight: horizontalScale(8),
    fontFamily: Fonts.sans,
  },
});