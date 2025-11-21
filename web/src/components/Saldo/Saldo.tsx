import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Saldo.css";
import Card from "../ui/Card/Card";
import { empresasService } from "../../services/empresasService";
import { authService } from "../../services/authService";
import { normalizarDinheiro } from "../../utils/normalizar-dinheiro";

const Saldo: React.FC = () => {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const carregarSaldo = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    const idEmpresa = authService.getEmpresaId();
    if (idEmpresa) {
      try {
        const dados = await empresasService.buscarDadosEmpresa(idEmpresa);
        if (dados && (typeof dados.saldo === 'number' || typeof dados.saldo === 'string')) {
           setSaldo(Number(dados.saldo));
        }
      } catch (error) {
        console.error("Erro ao buscar saldo:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarSaldo();

    const intervalo = setInterval(carregarSaldo, 5000);

    return () => clearInterval(intervalo);
  }, [location]); 

  return (
    <Card isPointer={false}>
      <div className="card-saldo">
        <h3>Saldo:</h3>
        <p>
          {loading ? "..." : saldo !== null ? normalizarDinheiro(saldo) : "R$ 0,00"}
        </p>
      </div>
    </Card>
  );
};

export default Saldo;