import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom"; 
import Header from "./components/layout/Header/Header";
import SideBar from "./components/layout/SideBar/SideBar";
import EsqueceuSenha from "./pages/EsqueceuSenha/EsqueceuSenha";
import AdicionarSaldo from "./pages/AdicionarSaldo/AdicionarSaldo";
import { Login } from "./pages/Login/Login";
import { Historico } from "./pages/Historico/Historico"; 

const RotaProtegida = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

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
      <Route path="/cadastro" element={<CadastroEmpresa />} />
      
      <Route
        path="/*"
        element={
          <RotaProtegida>
            <Layout>
              <Routes>
                <Route path="/" element={<div style={{padding: 20}}>Bem-vindo à Rydex!</div>} />
                <Route path="/adicionar-saldo" element={<AdicionarSaldo />}/>
                <Route path="/historico" element={<Historico />} />
                <Route path="/solicitar-entrega" element={<div style={{padding: 20}}>Solicitar Entrega (Em breve)</div>} />
                <Route path="/perfil" element={<div style={{padding: 20}}>Perfil (Em breve)</div>} />
              </Routes>
            </Layout>
          </RotaProtegida>
        }
      />
    </Routes>
  );
};

export default App;