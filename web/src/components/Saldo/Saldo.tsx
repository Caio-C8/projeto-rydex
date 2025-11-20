import React, { useEffect, useState } from "react";
import "./Saldo.css";
import Card from "../ui/Card/Card";
import { empresasService } from "../../services/empresasService";
import { authService } from "../../services/authService";
import { normalizarDinheiro } from "../../utils/normalizar-dinheiro";

const Saldo: React.FC = () => {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarSaldo();
  }, []);

  const carregarSaldo = async () => {
    // CORREÇÃO: Garante que o nome é getEmpresaId (Id = Identity)
    const idEmpresa = authService.getEmpresaId();

    if (idEmpresa) {
      try {
        const dados = await empresasService.buscarDadosEmpresa(idEmpresa);
        // Verifica se o saldo existe e é válido antes de setar
        if (dados && (typeof dados.saldo === 'number' || typeof dados.saldo === 'string')) {
           setSaldo(Number(dados.saldo));
        }
      } catch (error) {
        console.error("Erro ao buscar saldo:", error);
      }
    }
    setLoading(false);
  };

  return (
    <Card isPointer={false}>
      <div className="card-saldo">
        <h3>Saldo:</h3>
        <p>
          {loading 
            ? "..." 
            : saldo !== null 
              ? normalizarDinheiro(saldo) 
              : "R$ 0,00"
          }
        </p>
      </div>
    </Card>
  );
};

export default Saldo;