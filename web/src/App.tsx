import React, { useState } from "react";
import Header from "./components/layout/Header/Header";
import SideBar from "./components/layout/SideBar/SideBar";
import { Routes, Route, useLocation } from "react-router-dom";

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

const App: React.FC = () => {
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

        <Routes>
          <Route path="/" />
          <Route path="/adicionar-saldo" />
          <Route path="/historico" />
          <Route path="/solicitar-entrega" />
          <Route path="/perfil" />
        </Routes>
      </main>

      {isSideBarExpandida && (
        <div className="overlay" onClick={() => setIsSideBarExpandida(false)} />
      )}
    </>
  );
};

export default App;
