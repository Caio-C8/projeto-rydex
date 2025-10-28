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
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from 'expo-image-picker';

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
      {/* Ícone só aparece se for editável E tiver uma função */}
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
  const [nome, setNome] = useState("João Carlos");
  const [cpf] = useState("123.***.***-00");
  const [dataNasc] = useState("03/06/1990");
  const [celular, setCelular] = useState(""); // Começa vazio
  const [placa, setPlaca] = useState("XXX0X00");
  const [chavePix, setChavePix] = useState("joao@email.com");
  const [email, setEmail] = useState("joao@email.com");
  const [senha, setSenha] = useState("SenhaSuperSecreta");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [cnhDoc, setCnhDoc] = useState<Document | null>(null);
  const [veiculoDoc, setVeiculoDoc] = useState<Document | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Inicializa com os valores iniciais dos estados
  const [initialData, setInitialData] = useState(() => ({ nome, celular: maskPhoneNumber(celular), placa, chavePix, email, senha, cnhDoc, veiculoDoc }));

  // useEffect para carregar dados da API (exemplo)
  // useEffect(() => {
  //   async function fetchData() {
  //     // const userData = await fetchUserDataFromAPI();
  //     // setNome(userData.nome);
  //     // setCelular(maskPhoneNumber(userData.celular));
  //     // ... etc
  //     // setInitialData({ ...userData, celular: maskPhoneNumber(userData.celular) });
  //   }
  //   fetchData();
  // }, []);

  // useEffect para detectar mudanças
  useEffect(() => {
    // Só roda se initialData já foi carregado (importante para evitar falsos positivos na carga inicial)
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

  const handleSave = async () => { // Adicionado async para simular chamada API
    const rawPhone = celular.replace(/\D/g, "");
    if (celular && rawPhone.length < 11) {
      Alert.alert("Celular Inválido", "Por favor, preencha o número completo com DDD.");
      return;
    }

    const dataToSave = { nome, celular, placa, chavePix, email, senha /*, cnhUri: cnhDoc?.uri, veiculoUri: veiculoDoc?.uri*/ };

    // --- Simulação de chamada API ---
    // try {
    //   // const response = await fetch('URL_DA_SUA_API', { method: 'POST', body: JSON.stringify(dataToSave) });
    //   // if (!response.ok) throw new Error('Falha ao salvar');
    //   Alert.alert("Sucesso", "Seus dados foram salvos com sucesso!");
    //   setInitialData({ nome, celular, placa, chavePix, email, senha, cnhDoc, veiculoDoc }); // Atualiza initialData com os valores atuais
    //   setIsDirty(false); // Esconde botões
    // } catch (error) {
    //   Alert.alert("Erro", "Não foi possível salvar os dados.");
    // }
    // --- Fim Simulação ---

    // Remover esta parte quando integrar API
    Alert.alert("Sucesso", "Seus dados foram salvos com sucesso! (Simulado)");
    setInitialData({ nome, celular, placa, chavePix, email, senha, cnhDoc, veiculoDoc });
    setIsDirty(false);
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>Perfil</Text>
                <Text style={styles.headerSubtitle}>Alterar dados</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Sair</Text>
                <Feather name="log-out" size={moderateScale(20)} color="#333" />
            </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
            <EditableInput label="Nome completo:" value={nome} onChangeText={setNome} onIconPress={() => Alert.alert("Editar nome?")} />
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
                    <EditableInput label="Celular:" value={celular} onChangeText={(text) => setCelular(maskPhoneNumber(text))} keyboardType="numeric" maxLength={15} onIconPress={() => Alert.alert("Editar celular?")}/>
                </View>
                <View style={{flex: 1, marginLeft: horizontalScale(8)}}>
                    <EditableInput label="Placa veículo:" value={placa} onChangeText={setPlaca} onIconPress={() => Alert.alert("Editar placa?")}/>
                </View>
            </View>
            <EditableInput label="Chave pix:" value={chavePix} onChangeText={setChavePix} onIconPress={() => Alert.alert("Editar Chave Pix?")}/>
            <EditableInput label="E-mail:" value={email} onChangeText={setEmail} keyboardType="email-address" onIconPress={() => Alert.alert("Editar e-mail?")}/>
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
      {/* A BARRA DE NAVEGAÇÃO SERÁ GERADA PELO _layout.tsx */}
    </SafeAreaView>
  );
};

export default ProfileScreen;

// ========================================================================
// --- 4. ESTILOS COM ESCALA MODERADA ---
// ========================================================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    paddingBottom: verticalScale(100) // Espaço para a navBar não sobrepor o conteúdo
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
    height: verticalScale(50), // Altura fixa e responsiva
    fontSize: moderateScale(16),
    color: '#333'
  },
  row: {
    flexDirection: 'row',
    // Espaçamento será dado pelas margens dos filhos
  },
  docPickerContainer: {
    flex: 1, alignItems: 'center',
    // marginHorizontal dado pelos filhos da row
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
      marginTop: verticalScale(24), // Espaço acima dos botões
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
    marginTop: verticalScale(12), // Espaço entre os botões
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold'
  },
  // ESTILOS DA NAVBAR NÃO SÃO MAIS NECESSÁRIOS AQUI
});
