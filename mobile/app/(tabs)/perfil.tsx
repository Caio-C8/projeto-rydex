import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardTypeOptions,
  ActivityIndicator,
  // Switch removido
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from 'expo-router';

// 1. IMPORTADO O AUTH CONTEXT
import { useAuth } from '../../context/AuthContext';

// Importado do theme.ts
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale, moderateScale } from '../../constants/theme';

// ... (Funções Utilitárias e Componentes Reutilizáveis continuam iguais) ...
const maskPhoneNumber = (text: string) => {
  const cleaned = text.replace(/\D/g, '').substring(0, 11);
  if (cleaned.length === 0) return "";
  if (cleaned.length < 2) return `(${cleaned}`;
  let formatted = `(${cleaned.substring(0, 2)})`;
  const remaining = cleaned.substring(2);
  if (remaining.length > 0) formatted += ` ${remaining.substring(0, 5)}`;
  if (remaining.length > 5) formatted += `-${remaining.substring(5)}`;
  return formatted;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Document { uri: string; name: string; }
interface EditableInputProps { 
  label: string; value: string; onChangeText: (text: string) => void; 
  themeColors: typeof Colors.light; placeholder?: string; keyboardType?: KeyboardTypeOptions; 
  secureTextEntry?: boolean; iconName?: keyof typeof Feather.glyphMap; onIconPress?: () => void; 
  editable?: boolean; maxLength?: number; 
}
interface DocumentPickerProps { 
  label: string; document: Document | null; onPickDocument: () => void; themeColors: typeof Colors.light; 
}

const EditableInput: React.FC<EditableInputProps> = ({ 
  label, value, onChangeText, placeholder, keyboardType, 
  secureTextEntry, iconName = "edit-2", onIconPress, 
  editable = true, maxLength, themeColors 
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: themeColors.textGray }]}>{label}</Text>
    <View style={[styles.inputRow, { borderColor: themeColors.lightGray }]}>
      <TextInput
        style={[styles.input, { color: themeColors.text }]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        keyboardType={keyboardType} secureTextEntry={secureTextEntry}
        placeholderTextColor={themeColors.textGray} editable={editable} maxLength={maxLength}
      />
      {editable && onIconPress && (
        <TouchableOpacity onPress={onIconPress}>
          <Feather name={iconName} size={moderateScale(20)} color={themeColors.textGray} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const DocumentPicker: React.FC<DocumentPickerProps> = ({ label, document, onPickDocument, themeColors }) => (
  <View style={styles.docPickerContainer}>
    <Text style={[styles.label, { color: themeColors.textGray }]}>{label}</Text>
    <TouchableOpacity 
      style={[styles.docPickerButton, { borderColor: themeColors.lightGray, backgroundColor: themeColors.appBackground === '#fff' ? '#fafafa' : themeColors.appBackground }]} 
      onPress={onPickDocument}>
      <MaterialCommunityIcons name="file-document-outline" size={moderateScale(32)} color={themeColors.textGray} />
      <Text style={[styles.docPickerText, { color: themeColors.textGray }]}>
        {document ? 'Documento Selecionado' : `doc-${label.toLowerCase().replace('.', '')}.jpg`}
      </Text>
    </TouchableOpacity>
  </View>
);

// --- COMPONENTE PRINCIPAL ---
export default function ProfileScreen() {
  const [nome, setNome] = useState("Carregando...");
  const [cpf, setCpf] = useState("...");
  const [dataNasc, setDataNasc] = useState("...");
  const [celular, setCelular] = useState("...");
  const [placa, setPlaca] = useState("...");
  const [chavePix, setChavePix] = useState("...");
  const [email, setEmail] = useState("...");
  const [senha, setSenha] = useState("SenhaSuperSecreta");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [cnhDoc, setCnhDoc] = useState<Document | null>(null);
  const [veiculoDoc, setVeiculoDoc] = useState<Document | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  // 2. USANDO O AUTH CONTEXT
  const { signOut } = useAuth();
  
  // Força tema claro
  const themeColors = Colors['light'];

  useEffect(() => {
    if (!API_URL) {
      Alert.alert("Erro de Configuração", "URL da API não encontrada.");
      setIsLoading(false); setNome("Erro"); setCpf("Erro"); setDataNasc("Erro");
      return;
    }
    async function carregarDadosDoPerfil() {
      try {
        const usuarioId = "123"; 
        const response = await fetch(`${API_URL}/usuario/${usuarioId}`);
        if (!response.ok) throw new Error("Falha ao buscar dados");
        const dadosDoBanco = await response.json();
        setNome(dadosDoBanco.nome || ""); setCpf(dadosDoBanco.cpf || ""); setDataNasc(dadosDoBanco.dataNasc || "");
        setCelular(maskPhoneNumber(dadosDoBanco.celular || "")); setPlaca(dadosDoBanco.placa || "");
        setChavePix(dadosDoBanco.chavePix || ""); setEmail(dadosDoBanco.email || "");
        setInitialData({ ...dadosDoBanco, celular: maskPhoneNumber(dadosDoBanco.celular || "") });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        Alert.alert("Erro de Rede", `Erro: ${error.message}`);
        setNome("Erro de Rede"); setCpf("..."); setDataNasc("...");
      } finally { setIsLoading(false); }
    }
    carregarDadosDoPerfil();
  }, []); 

  useEffect(() => {
    if (!initialData) return; 
    const hasChanged = initialData.nome !== nome || initialData.celular !== celular || initialData.placa !== placa || initialData.chavePix !== chavePix || initialData.email !== email || initialData.senha !== senha || initialData.cnhDoc !== cnhDoc || initialData.veiculoDoc !== veiculoDoc;
    setIsDirty(hasChanged);
  }, [nome, celular, placa, chavePix, email, senha, cnhDoc, veiculoDoc, initialData]);

  const handlePickImage = async (setter: (doc: Document | null) => void) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) { Alert.alert("Permissão Necessária", "É preciso permitir o acesso à galeria."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled && result.assets) {
      const pickedAsset = result.assets[0];
      const fileName = pickedAsset.uri.split('/').pop() || 'documento.jpg';
      setter({ uri: pickedAsset.uri, name: fileName });
    }
  };

  const handleSave = async () => {
    const rawPhone = celular.replace(/\D/g, "");
    if (celular && rawPhone.length < 11) { Alert.alert("Celular Inválido", "Preencha completo."); return; }
    Alert.alert("Sucesso", "Simulação: Dados salvos!");
    setIsDirty(false);
  };

  const handleCancel = () => {
    if (!initialData) return;
    setNome(initialData.nome); setCelular(initialData.celular); setPlaca(initialData.placa);
    setChavePix(initialData.chavePix); setEmail(initialData.email); setSenha(initialData.senha);
    setCnhDoc(initialData.cnhDoc); setVeiculoDoc(initialData.veiculoDoc);
    setIsDirty(false);
  };

  // 3. FUNÇÃO DE LOGOUT ATUALIZADA
  const handleLogout = async () => {
    try {
      await signOut(); // Limpa o token
      // O index.tsx vai perceber a mudança e redirecionar, 
      // mas forçamos aqui para garantir
      router.replace('/login'); 
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
        <View style={[styles.loadingContainer, { backgroundColor: themeColors.appBackground }]}>
          <ActivityIndicator size="large" color={themeColors.textGray} />
          <Text style={[styles.loadingText, { color: themeColors.textGray }]}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.appBackground }]}>
      <StatusBar barStyle={'dark-content'} backgroundColor={themeColors.appBackground} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: themeColors.appBackground }]}>
            <View>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>Perfil</Text>
                <Text style={[styles.headerSubtitle, { color: themeColors.textGray }]}>Alterar dados</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: themeColors.background }]} 
              onPress={handleLogout}
            >
                <Text style={[styles.logoutButtonText, { color: themeColors.text }]}>Sair</Text>
                <Feather name="log-out" size={moderateScale(20)} color={themeColors.text} />
            </TouchableOpacity>
        </View>

        <View style={[styles.formContainer, { backgroundColor: themeColors.background }]}>
            <EditableInput label="Nome completo:" value={nome} onChangeText={setNome} themeColors={themeColors} />
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: horizontalScale(8)}}>
                    <EditableInput label="CPF:" value={cpf} editable={false} themeColors={themeColors} />
                </View>
                <View style={{flex: 1, marginLeft: horizontalScale(8)}}>
                    <EditableInput label="Data de nasc:" value={dataNasc} editable={false} themeColors={themeColors} />
                </View>
            </View>
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: horizontalScale(8)}}>
                    <EditableInput label="Celular:" value={celular} onChangeText={(text) => setCelular(maskPhoneNumber(text))} keyboardType="numeric" maxLength={15} themeColors={themeColors} />
                </View>
                <View style={{flex: 1, marginLeft: horizontalScale(8)}}>
                    <EditableInput label="Placa veículo:" value={placa} onChangeText={setPlaca} themeColors={themeColors} />
                </View>
            </View>
            <EditableInput label="Chave pix:" value={chavePix} onChangeText={setChavePix} themeColors={themeColors} />
            <EditableInput label="E-mail:" value={email} onChangeText={setEmail} keyboardType="email-address" themeColors={themeColors} />
            <EditableInput label="Senha:" value={senha} onChangeText={setSenha} secureTextEntry={!isPasswordVisible} iconName={isPasswordVisible ? "eye-off" : "eye"} onIconPress={() => setIsPasswordVisible(!isPasswordVisible)} themeColors={themeColors} />
            <View style={[styles.row, {marginTop: verticalScale(16)}]}>
                <DocumentPicker label="CNH:" document={cnhDoc} onPickDocument={() => handlePickImage(setCnhDoc)} themeColors={themeColors} />
                <DocumentPicker label="Doc. veículo:" document={veiculoDoc} onPickDocument={() => handlePickImage(setVeiculoDoc)} themeColors={themeColors} />
            </View>

            {isDirty && (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>SALVAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.buttonText}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... (Estilos permanecem iguais, com Fonts.sans) ...
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, paddingBottom: verticalScale(100) },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: verticalScale(10), fontSize: FontSizes.body, fontFamily: Fonts.sans },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: horizontalScale(20), paddingTop: verticalScale(50), paddingBottom: verticalScale(16) },
  headerTitle: { fontSize: FontSizes.titleLarge, fontWeight: 'bold', fontFamily: Fonts.sans },
  headerSubtitle: { fontSize: FontSizes.body, fontFamily: Fonts.sans },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(8), paddingHorizontal: horizontalScale(16), borderRadius: moderateScale(20), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  logoutButtonText: { marginRight: horizontalScale(8), fontSize: FontSizes.body, fontFamily: Fonts.sans },
  formContainer: { marginHorizontal: horizontalScale(20), marginTop: verticalScale(10), padding: horizontalScale(20), borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84 },
  inputContainer: { marginBottom: verticalScale(16) },
  label: { fontSize: FontSizes.caption, marginBottom: verticalScale(4), fontFamily: Fonts.sans },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: horizontalScale(12) },
  input: { flex: 1, height: verticalScale(50), fontSize: FontSizes.body, fontFamily: Fonts.sans },
  row: { flexDirection: 'row', gap: horizontalScale(16) },
  docPickerContainer: { flex: 1, alignItems: 'center', marginTop: verticalScale(8) },
  docPickerButton: { width: '100%', height: verticalScale(120), borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: moderateScale(10) },
  docPickerText: { marginTop: verticalScale(8), fontSize: FontSizes.small, textAlign: 'center', fontFamily: Fonts.sans },
  actionButtonsContainer: { marginTop: verticalScale(24) },
  saveButton: { backgroundColor: '#2E8B57', padding: verticalScale(14), borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#DC143C', padding: verticalScale(14), borderRadius: 12, alignItems: 'center', marginTop: verticalScale(12) },
  buttonText: { color: '#fff', fontSize: FontSizes.body, fontWeight: 'bold', fontFamily: Fonts.sans },
});