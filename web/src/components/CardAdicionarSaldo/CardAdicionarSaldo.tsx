import React, { useState } from "react";
import "./CardAdicionarSaldo.css";
import Card from "../ui/Card/Card";
import BotaoTexto from "../ui/Botao/BotaoTexto";
import { normalizarDinheiro } from "../../utils/normalizar-dinheiro";
import { ModalPix } from "../ModalPix/ModalPix"; 
import { empresasService } from "../../services/empresasService"; 
import { toast } from "react-toastify"; 

interface CardAdicionarSaldoProps {
  valor: number;
  saldoAtual: number;
  onSucesso: () => void; 
}

const CardAdicionarSaldo: React.FC<CardAdicionarSaldoProps> = ({ valor, saldoAtual, onSucesso }) => {
  const [modalAberto, setModalAberto] = useState(false);

  // Cálculos matemáticos seguros
  const saldoSeguro = Number(saldoAtual) || 0;
  const valorSeguro = Number(valor) || 0;
  const saldoFuturo = saldoSeguro + valorSeguro;

  const handleConfirmarPagamento = async () => {
    try {
      await empresasService.adicionarSaldo(valorSeguro);
      
      toast.success(`Pagamento confirmado! ${normalizarDinheiro(valorSeguro)} creditados.`);
      setModalAberto(false);
      onSucesso(); 
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar pagamento.");
    }
  };

  return (
    <>
      <Card isPointer={false}>
        <p className="adicionar-saldo-card-texto">Adicionar via Pix</p>

        <div className="valor-adicionar">
          <h3>R$</h3>
          <h1>{(valorSeguro / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h1>
        </div>

        <div className="saldo-atual">
          <p className="adicionar-saldo-card-texto">Saldo atual:</p>
          <p className="adicionar-saldo-card-texto">
            {normalizarDinheiro(saldoSeguro)}
          </p>
        </div>

        <div className="saldo-depois">
          <p className="adicionar-saldo-card-texto">Saldo após adicionar:</p>
          {/* Mostra a soma do saldo atual + valor do card */}
          <p className="adicionar-saldo-card-texto" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            {normalizarDinheiro(saldoFuturo)}
          </p>
        </div>

        <div className="adicionar-saldo-btn">
          <BotaoTexto 
            texto="Adicionar Saldo" 
            corFundo="#4CAF50" 
            corBorda="#4CAF50" 
            onClick={() => setModalAberto(true)} 
          />
        </div>
      </Card>

      {modalAberto && (
        <ModalPix 
          valor={valorSeguro} 
          onConfirmar={handleConfirmarPagamento} 
          onFechar={() => setModalAberto(false)} 
        />
      )}
    </>
  );
};

export default CardAdicionarSaldo;