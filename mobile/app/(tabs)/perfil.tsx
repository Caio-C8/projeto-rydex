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
  Dimensions,
  KeyboardTypeOptions,
  ActivityIndicator
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from 'expo-image-picker';
import { router } from 'expo-router'; // Importa o router para o Logout

// ========================================================================
// --- 1. LÓGICA DE RESPONSIVIDADE (ESCALA PROFISSIONAL) ---
// ========================================================================
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size) => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = (size) => (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;

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

// --- CORREÇÃO AQUI ---
// Remove as aspas. Agora ele lê a variável de ambiente.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ========================================================================
// --- 2. COMPONENTES REUTILIZÁVEIS ---
// ========================================================================
interface Document { uri: string; name: string; }
interface EditableInputProps { label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; keyboardType?: KeyboardTypeOptions; secureTextEntry?: boolean; iconName?: keyof typeof Feather.glyphMap; onIconPress?: () => void; editable?: boolean; maxLength?: number; }
interface DocumentPickerProps { label: string; document: Document | null; onPickDocument: () => void; }

const EditableInput: React.FC<EditableInputProps> = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, iconName = "edit-2", onIconPress, editable = true, maxLength }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999"
        editable={editable}
        maxLength={maxLength}
      />
      {editable && onIconPress && (
        <TouchableOpacity onPress={onIconPress}>
          <Feather name={iconName} size={moderateScale(20)} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const DocumentPicker: React.FC<DocumentPickerProps> = ({ label, document, onPickDocument }) => (
  <View style={styles.docPickerContainer}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.docPickerButton} onPress={onPickDocument}>
      <MaterialCommunityIcons name="file-document-outline" size={moderateScale(32)} color="#555" />
      <Text style={styles.docPickerText}>
        {document ? document.name.substring(0,15) + '...' : `doc-${label.toLowerCase().replace('.', '')}.jpg`}
      </Text>
    </TouchableOpacity>
  </View>
);

// ========================================================================
// --- 3. COMPONENTE PRINCIPAL ---
// ========================================================================
const ProfileScreen: React.FC = () => {
  // --- Estados começam vazios ou "carregando" ---
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

  // --- InitialData começa como null ---
  const [initialData, setInitialData] = useState(null);

  // --- useEffect para CARREGAR dados da API ---
  useEffect(() => {
    // --- CORREÇÃO AQUI: Verifica se a API_URL existe
    if (!API_URL) {
      Alert.alert("Erro de Configuração", "URL da API não encontrada. Verifique seu arquivo .env");
      setIsLoading(false);
      setNome("Erro"); setCpf("Erro"); setDataNasc("Erro");
      return;
    }

    async function carregarDadosDoPerfil() {
      try {
        const usuarioId = "123"; // (Substituir pelo ID real)
        
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/usuario/${usuarioId}`);
        if (!response.ok) {
          throw new Error("Falha ao buscar dados do servidor");
        }
        
        const dadosDoBanco = await response.json();

        // Preenche os estados com os dados do banco
        setNome(dadosDoBanco.nome || "");
        setCpf(dadosDoBanco.cpf || "");
        setDataNasc(dadosDoBanco.dataNasc || "");
        setCelular(maskPhoneNumber(dadosDoBanco.celular || ""));
        setPlaca(dadosDoBanco.placa || "");
        setChavePix(dadosDoBanco.chavePix || "");
        setEmail(dadosDoBanco.email || "");
        
        // Define os dados iniciais para a lógica do "Cancelar" e "isDirty"
        setInitialData({
          ...dadosDoBanco,
          celular: maskPhoneNumber(dadosDoBanco.celular || "") // Salva com a máscara
        });

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        Alert.alert("Erro de Rede", `Não foi possível carregar seus dados. Verifique seu IP e se a API está rodando.\nErro: ${error.message}`);
        setNome("Erro de Rede"); setCpf("..."); setDataNasc("...");
      } finally {
        setIsLoading(false); // Para o indicador de carregamento
      }
    }

    carregarDadosDoPerfil();
  }, []); // O array vazio [] garante que isso rode apenas UMA VEZ


  // useEffect para detectar mudanças
  useEffect(() => {
    if (!initialData) return; 

    const hasChanged =
      initialData.nome !== nome ||
      initialData.celular !== celular ||
      initialData.placa !== placa ||
      initialData.chavePix !== chavePix ||
      initialData.email !== email ||
      initialData.senha !== senha ||
      initialData.cnhDoc !== cnhDoc ||
      initialData.veiculoDoc !== veiculoDoc;
    setIsDirty(hasChanged);
  }, [nome, celular, placa, chavePix, email, senha, cnhDoc, veiculoDoc, initialData]);

  // --- CORREÇÃO AQUI: Função de pegar imagem RESTAURADA ---
  const handlePickImage = async (setter: (doc: Document | null) => void) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão Necessária", "É preciso permitir o acesso à galeria.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1,
    });
    if (!result.canceled && result.assets) {
      const pickedAsset = result.assets[0];
      const fileName = pickedAsset.uri.split('/').pop() || 'documento.jpg';
      setter({ uri: pickedAsset.uri, name: fileName });
    }
  };

  // --- CORREÇÃO AQUI: Função handleSave com FormData ---
  const handleSave = async () => {
    const rawPhone = celular.replace(/\D/g, "");
    if (celular && rawPhone.length < 11) {
      Alert.alert("Celular Inválido", "Por favor, preencha o número completo com DDD.");
      return;
    }
    if (!process.env.EXPO_PUBLIC_API_URL) {
      Alert.alert("Erro de Configuração", "A URL da API não foi definida.");
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('celular', rawPhone);
    formData.append('placa', placa);
    formData.append('chavePix', chavePix);
    formData.append('email', email);
    formData.append('senha', senha);

    if (cnhDoc) {
      const uriParts = cnhDoc.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('cnhDoc', {
        uri: cnhDoc.uri, name: `cnh.${fileType}`, type: `image/${fileType}`,
      } as any);
    }
    if (veiculoDoc) {
      const uriParts = veiculoDoc.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('veiculoDoc', {
        uri: veiculoDoc.uri, name: `veiculo.${fileType}`, type: `image/${fileType}`,
      } as any);
    }

    try {
      const usuarioId = "123"; // (Substituir pelo ID real)
      
      const response = await fetch(`${API_URL}/usuario/${usuarioId}`, {
        method: 'POST', // ou 'PUT'
        body: formData,
        headers: {
          // NÃO defina 'Content-Type'. O fetch/FormData faz isso.
          // 'Authorization': 'Bearer SEU_TOKEN_DE_LOGIN'
        },
      });

      if (!response.ok) {
        const erroApi = await response.text(); 
        throw new Error(`Falha ao salvar no servidor: ${erroApi}`);
      }
      
      Alert.alert("Sucesso", "Seus dados foram salvos com sucesso!");
      setInitialData({ nome, celular: maskPhoneNumber(rawPhone), placa, chavePix, email, senha, cnhDoc, veiculoDoc });
      setIsDirty(false);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", `Não foi possível salvar suas alterações. ${error.message}`);
    }
  };

  // --- CORREÇÃO AQUI: Função handleCancel RESTAURADA ---
  const handleCancel = () => {
    if (!initialData) return;
    setNome(initialData.nome);
    setCelular(initialData.celular);
    setPlaca(initialData.placa);
    setChavePix(initialData.chavePix);
    setEmail(initialData.email);
    setSenha(initialData.senha);
    setCnhDoc(initialData.cnhDoc);
    setVeiculoDoc(initialData.veiculoDoc);
    setIsDirty(false);
  };

  // --- CORREÇÃO AQUI: Função handleLogout ADICIONADA ---
  const handleLogout = () => {
    // (Lógica futura: limpar o token do AsyncStorage)
    router.replace('/login'); // Navega para a tela de login
  };

  // --- Return de "Carregando..." ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#555" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Return Principal (JSX) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>Perfil</Text>
                <Text style={styles.headerSubtitle}>Alterar dados</Text>
            </View>
            {/* --- CORREÇÃO AQUI: Adicionado onPress={handleLogout} --- */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sair</Text>
                <Feather name="log-out" size={moderateScale(20)} color="#333" />
            </TouchableOpacity>
        </View>

        {/* --- CORREÇÃO AQUI: Removida a View duplicada --- */}
        <View style={styles.formContainer}>
            <EditableInput label="Nome completo:" value={nome} onChangeText={setNome} onIconPress={() => {}} />
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: horizontalScale(8)}}>
                    <EditableInput label="CPF:" value={cpf} editable={false} />
                </View>
                <View style={{flex: 1, marginLeft: horizontalScale(8)}}>
                    <EditableInput label="Data de nasc:" value={dataNasc} editable={false} />
                </View>
            </View>
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: horizontalScale(8)}}>
                    <EditableInput label="Celular:" value={celular} onChangeText={(text) => setCelular(maskPhoneNumber(text))} keyboardType="numeric" maxLength={15} onIconPress={() => {}}/>
                </View>
                <View style={{flex: 1, marginLeft: horizontalScale(8)}}>
                    <EditableInput label="Placa veículo:" value={placa} onChangeText={setPlaca} onIconPress={() => {}}/>
                </View>
            </View>
            <EditableInput label="Chave pix:" value={chavePix} onChangeText={setChavePix} onIconPress={() => {}}/>
            <EditableInput label="E-mail:" value={email} onChangeText={setEmail} keyboardType="email-address" onIconPress={() => {}}/>
            <EditableInput
                label="Senha:" value={senha} onChangeText={setSenha} secureTextEntry={!isPasswordVisible}
                iconName={isPasswordVisible ? "eye-off" : "eye"} onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
            <View style={[styles.row, {marginTop: verticalScale(16)}]}>
                <DocumentPicker label="CNH:" document={cnhDoc} onPickDocument={() => handlePickImage(setCnhDoc)} />
                <DocumentPicker label="Doc. veículo:" document={veiculoDoc} onPickDocument={() => handlePickImage(setVeiculoDoc)} />
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

export default ProfileScreen;

// ========================================================================
// --- 4. ESTILOS ---
// ========================================================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    paddingBottom: verticalScale(100)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(16),
    color: '#555',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(16),
    backgroundColor: '#f0f2f5',
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#333'
  },
  headerSubtitle: {
    fontSize: moderateScale(16),
    color: '#666'
  },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(20),
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41,
  },
  logoutButtonText: {
    marginRight: horizontalScale(8),
    fontSize: moderateScale(16),
    color: '#333'
  },
  formContainer: {
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(10),
    padding: horizontalScale(20),
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84,
  },
  inputContainer: {
    marginBottom: verticalScale(16)
  },
  label: {
    fontSize: moderateScale(14),
    color: '#555',
    marginBottom: verticalScale(4)
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: horizontalScale(12),
  },
  input: {
    flex: 1,
    height: verticalScale(50),
    fontSize: moderateScale(16),
    color: '#333'
  },
  row: {
    flexDirection: 'row',
    gap: horizontalScale(16) // Adicionado gap para espaçamento
  },
  docPickerContainer: {
    flex: 1, alignItems: 'center',
    marginTop: verticalScale(8),
  },
  docPickerButton: {
    width: '100%',
    height: verticalScale(120),
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa',
    padding: moderateScale(10),
  },
  docPickerText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12),
    color: '#777',
    textAlign: 'center',
  },
  actionButtonsContainer: {
      marginTop: verticalScale(24),
  },
  saveButton: {
    backgroundColor: '#2E8B57',
    padding: verticalScale(14),
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#DC143C',
    padding: verticalScale(14),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: verticalScale(12),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold'
  },
});