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
  useColorScheme,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from 'expo-router';

// Imports do Tema e Serviços
import { Colors, FontSizes, Fonts, verticalScale, horizontalScale, moderateScale } from '../../constants/theme';
import { entregadoresService } from "../../services/entregadores.service";
import { authService } from "../../services/auth.service";
import { tratarErroApi } from "../../utils/api-error-handler";
import { ImageFile } from "../../types/dtos";
import { EntregadorPerfil } from "../../types/api.types";

// ========================================================================
// --- Funções Utilitárias ---
// ========================================================================
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

// Converte YYYY-MM-DD (Backend) para DD/MM/AAAA (Visual)
const formatDateToDisplay = (isoDate: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  // Ajuste do fuso horário local para exibir corretamente o dia
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  
  const dia = String(adjustedDate.getDate()).padStart(2, '0');
  const mes = String(adjustedDate.getMonth() + 1).padStart(2, '0');
  const ano = adjustedDate.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

// ========================================================================
// --- COMPONENTES REUTILIZÁVEIS (Mantidos) ---
// ========================================================================
interface Document { uri: string; name: string; type?: string } // Adicionei type opcional
interface EditableInputProps { 
  label: string; 
  value: string; 
  onChangeText: (text: string) => void; 
  themeColors: typeof Colors.light;
  placeholder?: string; 
  keyboardType?: KeyboardTypeOptions; 
  secureTextEntry?: boolean; 
  iconName?: keyof typeof Feather.glyphMap; 
  onIconPress?: () => void; 
  editable?: boolean; 
  maxLength?: number; 
}
interface DocumentPickerProps { 
  label: string; 
  document: Document | null; 
  onPickDocument: () => void; 
  themeColors: typeof Colors.light;
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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={themeColors.textGray}
        editable={editable}
        maxLength={maxLength}
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
      style={[
        styles.docPickerButton, 
        { 
          borderColor: themeColors.lightGray, 
          backgroundColor: themeColors.appBackground === '#fff' ? '#fafafa' : themeColors.appBackground 
        }
      ]} 
      onPress={onPickDocument}>
      <MaterialCommunityIcons name="file-document-outline" size={moderateScale(32)} color={themeColors.textGray} />
      <Text style={[styles.docPickerText, { color: themeColors.textGray }]}>
        {document ? document.name.substring(0,15) + '...' : `Alterar ${label}`}
      </Text>
    </TouchableOpacity>
  </View>
);

// ========================================================================
// --- COMPONENTE PRINCIPAL ---
// ========================================================================
const ProfileScreen: React.FC = () => {
  // --- Estados ---
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [celular, setCelular] = useState("");
  const [placa, setPlaca] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); // Senha vazia por padrão (só preenche se for trocar)
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [cnhDoc, setCnhDoc] = useState<Document | null>(null);
  const [veiculoDoc, setVeiculoDoc] = useState<Document | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [initialData, setInitialData] = useState<Partial<EntregadorPerfil> | null>(null);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // --- CARREGAR PERFIL ---
  useEffect(() => {
    async function carregarDados() {
      try {
        const perfil = await entregadoresService.buscarMeusDados();
        
        setNome(perfil.nome);
        setCpf(perfil.cpf);
        setDataNasc(formatDateToDisplay(perfil.data_nascimento)); // Formata para visualização
        setCelular(maskPhoneNumber(perfil.celular));
        setPlaca(perfil.placa_veiculo);
        setChavePix(perfil.chave_pix);
        setEmail(perfil.email);
        
        setInitialData(perfil); // Guarda o original para comparar mudanças ou cancelar
      } catch (error) {
        const msg = tratarErroApi(error);
        Alert.alert("Erro", msg);
      } finally {
        setIsLoading(false);
      }
    }
    carregarDados();
  }, []);

  // --- DETECTAR MUDANÇAS ---
  useEffect(() => {
    if (!initialData) return;
    
    // Compara valor atual com o inicial (ou verifica se há senha/arquivos novos)
    const hasChanged =
      nome !== initialData.nome ||
      celular !== maskPhoneNumber(initialData.celular || "") ||
      placa !== initialData.placa_veiculo ||
      chavePix !== initialData.chave_pix ||
      email !== initialData.email ||
      senha.length > 0 || // Se digitou senha, mudou
      cnhDoc !== null || // Se selecionou arquivo, mudou
      veiculoDoc !== null;

    setIsDirty(hasChanged);
  }, [nome, celular, placa, chavePix, email, senha, cnhDoc, veiculoDoc, initialData]);

  // --- SELECIONAR IMAGEM ---
  const handlePickImage = async (setter: (doc: Document | null) => void) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão Necessária", "É preciso permitir o acesso à galeria.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
    });
    
    if (!result.canceled && result.assets) {
      const pickedAsset = result.assets[0];
      setter({ 
        uri: pickedAsset.uri, 
        name: pickedAsset.fileName || `upload_${Date.now()}.jpg`,
        type: pickedAsset.mimeType || 'image/jpeg'
      });
    }
  };

  // --- SALVAR ---
  const handleSave = async () => {
    const rawPhone = celular.replace(/\D/g, "");
    
    if (celular && rawPhone.length < 11) {
      Alert.alert("Atenção", "Celular inválido.");
      return;
    }

    setIsSaving(true);

    try {
      // Prepara arquivos (converte para o tipo ImageFile esperado pelo service)
      const cnhFile: ImageFile | undefined = cnhDoc ? { 
        uri: cnhDoc.uri, name: cnhDoc.name, type: cnhDoc.type || 'image/jpeg' 
      } : undefined;

      const docFile: ImageFile | undefined = veiculoDoc ? { 
        uri: veiculoDoc.uri, name: veiculoDoc.name, type: veiculoDoc.type || 'image/jpeg' 
      } : undefined;

      // Chama o serviço de update
      const perfilAtualizado = await entregadoresService.atualizarPerfil({
        nome,
        email,
        celular: rawPhone,
        placaVeiculo: placa,
        chavePix,
        senha: senha.length > 0 ? senha : undefined, // Só envia se tiver digitado algo
      }, cnhFile, docFile);

      Alert.alert("Sucesso", "Perfil atualizado!");
      
      // Reseta estados para o novo valor
      setInitialData(perfilAtualizado);
      setSenha(""); // Limpa campo de senha
      setCnhDoc(null);
      setVeiculoDoc(null);
      setIsDirty(false);

    } catch (error) {
      const msg = tratarErroApi(error);
      Alert.alert("Erro ao Salvar", msg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- CANCELAR ---
  const handleCancel = () => {
    if (!initialData) return;
    // Reverte para os dados originais
    setNome(initialData.nome || "");
    setCelular(maskPhoneNumber(initialData.celular || ""));
    setPlaca(initialData.placa_veiculo || "");
    setChavePix(initialData.chave_pix || "");
    setEmail(initialData.email || "");
    
    setSenha("");
    setCnhDoc(null);
    setVeiculoDoc(null);
    setIsDirty(false);
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
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
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={themeColors.appBackground} 
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.header, { backgroundColor: themeColors.appBackground }]}>
            <View>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>Perfil</Text>
                <Text style={[styles.headerSubtitle, { color: themeColors.textGray }]}>Meus dados</Text>
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
            <EditableInput 
              label="Nome completo:" value={nome} onChangeText={setNome} 
              themeColors={themeColors} 
            />
            
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
                    <EditableInput 
                      label="Celular:" value={celular} onChangeText={(text) => setCelular(maskPhoneNumber(text))} 
                      keyboardType="numeric" maxLength={15} 
                      themeColors={themeColors} 
                    />
                </View>
                <View style={{flex: 1, marginLeft: horizontalScale(8)}}>
                    <EditableInput 
                      label="Placa veículo:" value={placa} onChangeText={setPlaca} 
                      themeColors={themeColors} 
                    />
                </View>
            </View>

            <EditableInput 
              label="Chave pix:" value={chavePix} onChangeText={setChavePix} 
              themeColors={themeColors} 
            />
            
            <EditableInput 
              label="E-mail:" value={email} onChangeText={setEmail} keyboardType="email-address" 
              themeColors={themeColors} 
            />
            
            <EditableInput
              label="Nova Senha (opcional):" value={senha} onChangeText={setSenha} secureTextEntry={!isPasswordVisible}
              placeholder="Preencha apenas se quiser alterar"
              iconName={isPasswordVisible ? "eye-off" : "eye"} 
              onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              themeColors={themeColors} 
            />

            <View style={[styles.row, {marginTop: verticalScale(16)}]}>
                <DocumentPicker 
                  label="CNH:" document={cnhDoc} onPickDocument={() => handlePickImage(setCnhDoc)} 
                  themeColors={themeColors} 
                />
                <DocumentPicker 
                  label="Doc. veículo:" document={veiculoDoc} onPickDocument={() => handlePickImage(setVeiculoDoc)} 
                  themeColors={themeColors} 
                />
            </View>

            {isDirty && (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]} 
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                        {isSaving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={handleCancel}
                      disabled={isSaving}
                    >
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
// --- ESTILOS (Mantidos) ---
// ========================================================================
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
  },
  container: {
    flexGrow: 1,
    paddingBottom: verticalScale(100)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(16),
  },
  headerTitle: {
    fontSize: FontSizes.titleLarge,
    fontWeight: 'bold',
    fontFamily: Fonts.sans,
  },
  headerSubtitle: {
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  logoutButton: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(20),
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 1.41,
  },
  logoutButtonText: {
    marginRight: horizontalScale(8),
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  formContainer: {
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(10),
    padding: horizontalScale(20),
    borderRadius: 20,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 3.84,
  },
  inputContainer: {
    marginBottom: verticalScale(16)
  },
  label: {
    fontSize: FontSizes.caption,
    marginBottom: verticalScale(4),
    fontFamily: Fonts.sans,
  },
  inputRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: horizontalScale(12),
  },
  input: {
    flex: 1,
    height: verticalScale(50),
    fontSize: FontSizes.body,
    fontFamily: Fonts.sans,
  },
  row: {
    flexDirection: 'row',
    gap: horizontalScale(16)
  },
  docPickerContainer: {
    flex: 1, 
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  docPickerButton: {
    width: '100%',
    height: verticalScale(120),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center', 
    alignItems: 'center',
    padding: moderateScale(10),
  },
  docPickerText: {
    marginTop: verticalScale(8),
    fontSize: FontSizes.small,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  actionButtonsContainer: {
      marginTop: verticalScale(24),
      marginBottom: verticalScale(24),
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
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    fontFamily: Fonts.sans,
  },
});