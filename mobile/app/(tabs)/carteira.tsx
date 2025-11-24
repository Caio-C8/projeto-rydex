import { router, useFocusEffect } from "expo-router"; // useFocusEffect ajuda a atualizar ao voltar para a tela
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator, // Adicionado para feedback visual
} from "react-native";

// Import dos estilos e temas
import {
  Colors,
  FontSizes,
  Fonts,
  verticalScale,
  horizontalScale,
} from "../../constants/theme";

// Import do Serviço
import { entregadoresService } from "../../services/entregadores.service";
import { tratarErroApi } from "../../utils/api-error-handler"; // Se tiver este utilitário, use-o

const VALOR_MINIMO_SAQUE = 20.0;

export default function CarteiraScreen() {
  const [valorSaque, setValorSaque] = useState("");
  const [saldoAtual, setSaldoAtual] = useState(0); // Começa com 0 até carregar da API
  const [isLoading, setIsLoading] = useState(false); // Estado para loading do botão
  const [isFetching, setIsFetching] = useState(true); // Estado para carregamento inicial

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  // --- 1. BUSCAR SALDO REAL AO ENTRAR NA TELA ---
  useFocusEffect(
    useCallback(() => {
      carregarDadosCarteira();
    }, [])
  );

  const carregarDadosCarteira = async () => {
    try {
      setIsFetching(true);
      const dados = await entregadoresService.buscarMeusDados();
      // O backend geralmente retorna o saldo em centavos, convertemos para reais
      // Se o seu backend já retorna em reais, remova a divisão por 100
      setSaldoAtual(dados.saldo / 100);
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      Alert.alert("Erro", "Não foi possível carregar seu saldo.");
    } finally {
      setIsFetching(false);
    }
  };

  // Função para formatar o saldo como moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // --- 2. FUNÇÃO DE SAQUE INTEGRADA ---
  const handleSaque = async () => {
    // Converte "150,50" para 150.50
    const valorNumerico = parseFloat(valorSaque.replace(",", "."));

    // Validações Locais
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Valor Inválido", "Digite um valor numérico válido.");
      return;
    }

    if (valorNumerico < VALOR_MINIMO_SAQUE) {
      Alert.alert(
        "Valor Mínimo",
        `O valor mínimo para saque é ${formatCurrency(VALOR_MINIMO_SAQUE)}.`
      );
      return;
    }

    if (valorNumerico > saldoAtual) {
      Alert.alert("Saldo Insuficiente", "Você não tem saldo suficiente.");
      return;
    }

    // Início da Integração com API
    setIsLoading(true);

    try {
      // A API espera o valor em CENTAVOS (inteiro)
      const valorCentavos = Math.round(valorNumerico * 100);

      console.log(
        `💰 Solicitando saque: R$ ${valorNumerico} -> ${valorCentavos} centavos`
      );

      // Chama o serviço
      const perfilAtualizado = await entregadoresService.retirarSaldo(
        valorCentavos
      );

      // Sucesso! Atualiza o saldo local com a resposta do servidor
      setSaldoAtual(perfilAtualizado.saldo / 100);
      setValorSaque(""); // Limpa o campo

      // Redireciona para tela de sucesso
      router.push({
        pathname: "/saque-sucesso",
        params: { valor: valorNumerico },
      });
    } catch (error: any) {
      console.error("Erro no saque:", error);

      // Se tiver uma mensagem de erro específica da API, mostre-a
      const mensagemErro =
        error.response?.data?.mensagem ||
        "Não foi possível realizar o saque. Tente novamente.";

      // Se for um erro de "sistema offline" ou regra de negócio grave, redireciona para erro
      // Caso contrário, mostra um Alert
      Alert.alert("Falha no Saque", mensagemErro);

      // Opcional: Se quiser manter a tela de erro específica
      // router.push("/saque-erro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[styles.card, { backgroundColor: themeColors.background }]}
        >
          <Text style={[styles.title, { color: themeColors.rydexOrange }]}>
            Sacar Saldo
          </Text>

          <Text style={[styles.saldoLabel, { color: themeColors.rydexOrange }]}>
            Saldo Acumulado
          </Text>

          {/* Exibe loading ou o valor */}
          {isFetching ? (
            <ActivityIndicator
              size="small"
              color={themeColors.rydexOrange}
              style={{ marginBottom: 32 }}
            />
          ) : (
            <Text
              style={[styles.saldoValor, { color: themeColors.rydexOrange }]}
            >
              {formatCurrency(saldoAtual)}
            </Text>
          )}

          <Text style={[styles.inputLabel, { color: themeColors.textGray }]}>
            Valor para saque
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: themeColors.lightGray,
                color: themeColors.text,
              },
            ]}
            placeholder="R$ 0,00"
            placeholderTextColor={themeColors.textGray}
            keyboardType="numeric"
            value={valorSaque}
            onChangeText={setValorSaque}
            editable={!isLoading} // Bloqueia input enquanto carrega
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isLoading
                  ? themeColors.lightGray
                  : themeColors.rydexOrange,
              },
            ]}
            onPress={handleSaque}
            disabled={isLoading || isFetching}
          >
            {isLoading ? (
              <ActivityIndicator color={themeColors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: themeColors.white }]}>
                Sacar
              </Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.infoText, { color: themeColors.textGray }]}>
            O valor mínimo é de {formatCurrency(VALOR_MINIMO_SAQUE)}. O
            processamento pode levar alguns instantes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... MANTENHA OS ESTILOS (styles) EXATAMENTE COMO ESTAVAM ...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: horizontalScale(16),
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    padding: horizontalScale(24),
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: FontSizes.titleLarge,
    fontWeight: "bold",
    marginBottom: verticalScale(16),
    fontFamily: Fonts.sans,
  },
  saldoLabel: {
    fontSize: FontSizes.body,
    marginBottom: verticalScale(4),
    fontFamily: Fonts.sans,
  },
  saldoValor: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    marginBottom: verticalScale(32),
    fontFamily: Fonts.sans,
  },
  inputLabel: {
    fontSize: FontSizes.body,
    marginBottom: verticalScale(8),
    alignSelf: "flex-start",
    marginLeft: horizontalScale(4),
    fontFamily: Fonts.sans,
  },
  textInput: {
    width: "100%",
    padding: verticalScale(14),
    borderWidth: 1,
    borderRadius: 12,
    fontSize: FontSizes.body,
    marginBottom: verticalScale(24),
    textAlign: "left",
    fontFamily: Fonts.sans,
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(14),
    borderRadius: 12,
    marginBottom: verticalScale(24),
    height: verticalScale(50), // Altura fixa ajuda no layout do loading
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  infoText: {
    fontSize: FontSizes.caption,
    textAlign: "center",
    lineHeight: verticalScale(20),
    fontFamily: Fonts.sans,
  },
});
