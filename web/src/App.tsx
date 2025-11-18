import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import SideBar from "./components/layout/SideBar/SideBar";
import EsqueceuSenha from "./pages/EsqueceuSenha/EsqueceuSenha";
import AdicionarSaldo from "./pages/AdicionarSaldo/AdicionarSaldo";

const getTitulo = (path: string): string => {
  switch (path) {
    case "/":
      return "Início";
    case "/adicionar-saldo":
      return "Adicionar Saldo";
    case "/historico":
      return "Histórico";
    case "/solicitar-entrega":
      return "Solicitar Entrega";
    case "/perfil":
      return "Perfil";
    default:
      return "Início";
  }
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
      <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" />
              <Route path="/adicionar-saldo" element={<AdicionarSaldo />}/>
              <Route path="/historico" />
              <Route path="/solicitar-entrega" />
              <Route path="/perfil" />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;
