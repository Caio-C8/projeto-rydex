import React from "react";
import "./AdicionarSaldo.css";
import CardAdicionarSaldo from "../../components/CardAdicionarSaldo/CardAdicionarSaldo";

const valores = [2500, 5000, 10000];

const AdicionarSaldo: React.FC = () => {
  return (
    <div className="adicionar-saldo-container">
      {valores.map((valor) => (
        <div>
          <CardAdicionarSaldo valor={valor} />
        </div>
      ))}
    </div>
  );
};

export default AdicionarSaldo;
