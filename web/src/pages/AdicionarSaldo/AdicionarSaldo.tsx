import React, { useState, useEffect } from "react";
import "./AdicionarSaldo.css";
import CardAdicionarSaldo from "../../components/CardAdicionarSaldo/CardAdicionarSaldo";
import { empresasService } from "../../services/empresasService";

const valores = [2500, 5000, 10000]; // R$ 25, R$ 50, R$ 100

const AdicionarSaldo: React.FC = () => {
  const [saldoAtual, setSaldoAtual] = useState(0);

  const carregarSaldo = async () => {
    try {
      const dados = await empresasService.buscarDadosEmpresa();
      console.log("💰 Saldo vindo da API:", dados.saldo);

      // Atualiza o estado. Se vier null/undefined, fica 0.
      setSaldoAtual(Number(dados.saldo) || 0);
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    }
  };

  useEffect(() => {
    carregarSaldo();
  }, []);

  return (
    <div className="adicionar-saldo-container">
      <h2
        style={{
          width: "100%",
          marginBottom: "20px",
          color: "#333",
          textAlign: "center",
        }}
      >
        Escolha um valor para recarregar
      </h2>

      <div className="grid-cards">
        {valores.map((valor) => (
          <div key={valor} className="card-wrapper">
            <CardAdicionarSaldo
              valor={valor}
              saldoAtual={saldoAtual}
              onSucesso={carregarSaldo}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdicionarSaldo;
