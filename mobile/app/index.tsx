import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

export default function StartPage() {
  // 1. Pegamos o token e o estado de carregamento do nosso contexto
  const { userToken, isLoading } = useAuth();

  // 2. Enquanto o app está verificando se existe um token salvo no celular...
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.appBackground }}>
        <ActivityIndicator size="large" color={Colors.light.rydexOrange} />
      </View>
    );
  }

  // 3. Se o token existe (usuário já logou antes), manda direto para a Home (Abas)
  if (userToken) {
    return <Redirect href="/(tabs)/" />;
  }

  // 4. Se não tem token, manda para a tela de Login
  return <Redirect href="/login" />;
}