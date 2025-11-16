import React from "react";
import "./CardAdicionarSaldo.css";
import Card from "../ui/Card/Card";
import BotaoTexto from "../ui/Botao/BotaoTexto";
import { normalizarDinheiro } from "../../utils/normalizar-dinheiro";

interface CardAdicionarSaldoProps {
  valor: number;
}

const CardAdicionarSaldo: React.FC<CardAdicionarSaldoProps> = ({ valor }) => {
  const valorAtual = 100000;

  return (
    <Card isPointer={false}>
      <p className="adicionar-saldo-card-texto">Adicionar via pix</p>

      <div className="valor-adicionar">
        <h3>R$</h3>
        <h1>{`${valor / 100},00`}</h1>
      </div>

      <div className="saldo-atual">
        <p className="adicionar-saldo-card-texto">Saldo atual:</p>
        <p className="adicionar-saldo-card-texto">
          {normalizarDinheiro(valorAtual)}
        </p>
      </div>

      <div className="saldo-depois">
        <p className="adicionar-saldo-card-texto">Saldo após adicionar:</p>
        <p className="adicionar-saldo-card-texto">
          {normalizarDinheiro(valorAtual + valor)}
        </p>
      </div>

      <div className="adicionar-saldo-btn">
        <BotaoTexto texto="Adicionar" corFundo="#4CAF50" corBorda="#4CAF50" />
      </div>
    </Card>
  );
};

export default CardAdicionarSaldo;
