import React from "react";
import "./Saldo.css";
import Card from "../ui/Card/Card";

const Saldo: React.FC = () => {
  return (
    <Card isPointer={false}>
      <div className="card-saldo">
        <h3>Saldo:</h3>

        <p>R$ 1000,00</p>
      </div>
    </Card>
  );
};

export default Saldo;
