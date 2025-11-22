import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Hooks e Serviços
import { useNotificacoesEmpresa } from "./hooks/useNotificacoesEmpresa";

// Componentes de Layout
import Header from "./components/layout/Header/Header";
import SideBar from "./components/layout/SideBar/SideBar";

// Páginas
import { Login } from "./pages/Login/Login";
import EsqueceuSenha from "./pages/EsqueceuSenha/EsqueceuSenha";
import CadastroEmpresa from "./pages/Cadastro/CadastroEmpresa";
import { Inicio } from "./pages/Inicio/Inicio";
import { Historico } from "./pages/Historico/Historico";
import AdicionarSaldo from "./pages/AdicionarSaldo/AdicionarSaldo";
import { SolicitarEntrega } from "./pages/SolicitarEntrega/SolicitarEntrega"; // Importação da nova tela

// --- COMPONENTE DE PROTEÇÃO ---
const RotaProtegida = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// --- LAYOUT PRINCIPAL ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSideBarExpandida, setIsSideBarExpandida] = useState(false);
  const location = useLocation();
  
  const getTitulo = (path: string): string => {
    if (path.startsWith("/adicionar-saldo")) return "Adicionar Saldo";
    if (path.startsWith("/historico")) return "Histórico";
    if (path.startsWith("/solicitar-entrega")) return "Solicitar Entrega";
    if (path.startsWith("/perfil")) return "Perfil";
    if (path === "/") return "Início";
    return "Rydex"; 
  };

  const tituloDinamico = getTitulo(location.pathname);
  const isPerfil = location.pathname === "/perfil";

  useNotificacoesEmpresa();

  return (
    <>
      <SideBar isExpandido={isSideBarExpandida} setIsExpandido={setIsSideBarExpandida} />
      <main>
        <Header titulo={tituloDinamico} isPerfil={isPerfil} />
        <div className="conteudo">{children}</div>
      </main>
      {isSideBarExpandida && (
        <div className="overlay" onClick={() => setIsSideBarExpandida(false)} />
      )}
    </>
  );
};

// --- APP E ROTAS ---
const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* --- ROTAS PÚBLICAS --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/cadastro" element={<CadastroEmpresa />} />

        {/* --- ROTAS PROTEGIDAS (DASHBOARD) --- */}
        <Route
          path="/*"
          element={
            <RotaProtegida>
              <Layout>
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/adicionar-saldo" element={<AdicionarSaldo />} />
                  <Route path="/historico" element={<Historico />} />
                  
                  {/* Rota de Solicitar Entrega corrigida para usar o componente real */}
                  <Route path="/solicitar-entrega" element={<SolicitarEntrega />} />
                  
                  <Route path="/perfil" element={<div style={{padding: 20}}>Perfil (Em breve)</div>} />
                </Routes>
              </Layout>
            </RotaProtegida>
          }
        />
      </Routes>

      {/* TOAST GLOBAL (Sempre por cima de tudo) */}
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 999999 }} 
      />
    </>
  );
};

export default App;