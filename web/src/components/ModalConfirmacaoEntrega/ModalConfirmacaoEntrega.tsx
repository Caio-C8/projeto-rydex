import React from 'react';
import { FaTimes, FaMotorcycle, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaCheck } from 'react-icons/fa';
import BotaoTexto from '../ui/Botao/BotaoTexto';
import { normalizarDinheiro } from '../../utils/normalizar-dinheiro';
import './ModalConfirmacaoEntrega.css';

interface DadosSimulacao {
  valor: number;
  distancia: number;
  motoboys: number;
  tempo: number;
}

interface DadosEndereco {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
}

interface ModalConfirmacaoProps {
  onFechar: () => void;
  onConfirmar: () => void;
  dadosSimulacao: DadosSimulacao;
  dadosEndereco: DadosEndereco;
  carregando: boolean;
}

export const ModalConfirmacaoEntrega: React.FC<ModalConfirmacaoProps> = ({ 
  onFechar, 
  onConfirmar, 
  dadosSimulacao, 
  dadosEndereco,
  carregando 
}) => {
  return (
    <div className="modal-overlay-confirmacao">
      <div className="modal-confirmacao-content">
        
        <div className="confirmacao-header">
          <h2>Confirme seu Pedido</h2>
          <button onClick={onFechar} className="btn-close"><FaTimes /></button>
        </div>

        <div className="confirmacao-body">
          
          {/* BLOCO 1: ENDEREÇO (Resumo) */}
          <div className="info-bloco endereco-bloco">
            <span className="label-bloco">Destino</span>
            <p className="texto-endereco">
              <FaMapMarkerAlt className="icon-laranja" /> 
              {dadosEndereco.logradouro}, {dadosEndereco.numero}
            </p>
            <span className="subtexto-endereco">{dadosEndereco.bairro} - {dadosEndereco.cidade}</span>
          </div>

          {/* BLOCO 2: DADOS DA CORRIDA (Grid) */}
          <div className="info-grid">
            
            <div className="stat-box">
              <span className="label-stat">Distância</span>
              <div className="valor-stat">
                <FaMapMarkerAlt /> {(dadosSimulacao.distancia / 1000).toFixed(1)} km
              </div>
            </div>

            <div className="stat-box">
              <span className="label-stat">Tempo Est.</span>
              <div className="valor-stat">
                <FaClock /> {Math.round(dadosSimulacao.tempo / 60)} min
              </div>
            </div>

            <div className={`stat-box ${dadosSimulacao.motoboys > 0 ? 'sucesso' : 'erro'}`}>
              <span className="label-stat">Disponibilidade</span>
              <div className="valor-stat">
                <FaMotorcycle /> {dadosSimulacao.motoboys} online
              </div>
            </div>

          </div>

          <div className="divider-dashed"></div>

          {/* BLOCO 3: VALOR FINAL (Destaque) */}
          <div className="total-box">
            <span className="label-total">Valor Final da Corrida</span>
            <div className="valor-total">
              {normalizarDinheiro(dadosSimulacao.valor)}
            </div>
          </div>

        </div>

        <div className="confirmacao-footer">
          <button className="btn-cancelar" onClick={onFechar} disabled={carregando}>
            Voltar e Editar
          </button>
          <div className="btn-confirmar-wrapper">
            <BotaoTexto 
              texto={carregando ? "CRIANDO PEDIDO..." : "CONFIRMAR SOLICITAÇÃO"} 
              onClick={onConfirmar}
              corFundo="#4CAF50"
            />
          </div>
        </div>

      </div>
    </div>
  );
};