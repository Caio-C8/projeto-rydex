import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import SideBar from "./components/layout/SideBar/SideBar";
import EsqueceuSenha from "./pages/EsqueceuSenha/EsqueceuSenha";
import AdicionarSaldo from "./pages/AdicionarSaldo/AdicionarSaldo";
import { Login } from "./pages/Login/Login";
import Inicio from "./pages/Inicio/Inicio";

const getTitulo = (path: string): string => {
  if (path === "/") return "Início";
  if (path.startsWith("/adicionar-saldo")) return "Adicionar Saldo";
  if (path.startsWith("/historico")) return "Histórico";
  if (path.startsWith("/solicitar-entrega")) return "Solicitar Entrega";
  if (path.startsWith("/perfil")) return "Perfil";
  return "Rydex";
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSideBarExpandida, setIsSideBarExpandida] = useState(false);
  const location = useLocation();
  const tituloDinamico = getTitulo(location.pathname);
  const isPerfil = location.pathname === "/perfil";

  return (
    <>
      <SideBar
        isExpandido={isSideBarExpandida}
        setIsExpandido={setIsSideBarExpandida}
      />

      <main>
        <Header titulo={tituloDinamico} isPerfil={isPerfil} />

        <div className="conteudo">
          {children}
        </div>
      </main>

      {isSideBarExpandida && (
        <div className="overlay" onClick={() => setIsSideBarExpandida(false)} />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/adicionar-saldo" element={<AdicionarSaldo />} />
              <Route path="/historico" element={<div style={{ padding: 20 }}>Página de Histórico (Em breve)</div>} />
              <Route path="/solicitar-entrega" element={<div style={{ padding: 20 }}>Solicitar Entrega (Em breve)</div>} />
              <Route path="/perfil" element={<div style={{ padding: 20 }}>Perfil (Em breve)</div>} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;