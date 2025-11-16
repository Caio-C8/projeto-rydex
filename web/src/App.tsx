import { Routes, Route } from "react-router-dom";

// Páginas
import EsqueceuSenha from "./pages/EsqueceuSenha/EsqueceuSenha";

<Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

export default function App() {
  return (
    <Routes>

      <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

    </Routes>
  );
}
