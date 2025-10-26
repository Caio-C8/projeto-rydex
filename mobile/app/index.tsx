import { Redirect } from "expo-router";

export default function StartPage() {
  // Isto diz ao app: "Quando alguém abrir a rota principal (/),
  // mude imediatamente para a rota /login"
  return <Redirect href="/login" />;
}
