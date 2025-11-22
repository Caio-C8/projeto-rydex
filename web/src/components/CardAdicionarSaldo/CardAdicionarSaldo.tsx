import React, { useState } from "react";
import "./CardAdicionarSaldo.css";
import Card from "../ui/Card/Card";
import BotaoTexto from "../ui/Botao/BotaoTexto";
import { normalizarDinheiro } from "../../utils/normalizar-dinheiro";
import { ModalPix } from "../ModalPix/ModalPix"; 
import { empresasService } from "../../services/empresasService"; 
// 👇 IMPORTAÇÃO OBRIGATÓRIA PARA O ALERTA FUNCIONAR
import { toast } from "react-toastify"; 

interface CardAdicionarSaldoProps {
  valor: number;
  saldoAtual: number;
  onSucesso: () => void; 
}

const CardAdicionarSaldo: React.FC<CardAdicionarSaldoProps> = ({ valor, saldoAtual, onSucesso }) => {
  const [modalAberto, setModalAberto] = useState(false);

  // Cálculos seguros (evita NaN)
  const saldoSeguro = Number(saldoAtual) || 0;
  const valorSeguro = Number(valor) || 0;
  const saldoFuturo = saldoSeguro + valorSeguro;

  const handleConfirmarPagamento = async () => {
    console.log("💸 Iniciando processamento do pagamento...");

    try {
      // 1. Chama o backend
      await empresasService.adicionarSaldo(valorSeguro);
      console.log("✅ Backend respondeu com sucesso!");

      // 2. Fecha o modal primeiro (para o toast não ficar "preso" atrás dele visualmente)
      setModalAberto(false);

      // 3. Dispara o alerta verde
      toast.success(`Pagamento confirmado! ${normalizarDinheiro(valorSeguro)} creditados.`);

      // 4. Atualiza o saldo na tela
      onSucesso(); 

    } catch (error) {
      console.error("❌ Erro no pagamento:", error);
      
      // Alerta de erro
      toast.error("Erro ao processar pagamento. Tente novamente.");
      
      // Fecha o modal mesmo com erro, para o usuário tentar de novo
      setModalAberto(false); 
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