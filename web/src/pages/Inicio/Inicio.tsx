import React from "react";
import "./Inicio.css";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";

const Inicio: React.FC = () => {
  return (
    <div className="inicio">
      <h2 className="inicio-header">Entregas em andamento</h2>
      <div className="inicio-center">
        <p className="inicio-empty">Sem entregas em andamento</p>
        <h3 className="inicio-call">Realize uma solicitação de entrega</h3>
        <div className="inicio-btn-wrap">
          <a href="/solicitar-entrega" style={{ textDecoration: "none" }}>
            <BotaoTexto texto="SOLICITAR ENTREGA" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Inicio;