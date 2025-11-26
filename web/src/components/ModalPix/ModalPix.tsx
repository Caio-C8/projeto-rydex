import React, { useState } from "react";
import BotaoTexto from "../ui/Botao/BotaoTexto";
import {
  FaCopy,
  FaCheckCircle,
  FaTimes,
  FaQrcode,
  FaShieldAlt,
} from "react-icons/fa";
import { normalizarDinheiro } from "../../utils/normalizar-dinheiro";
import "./ModalPix.css";

const QR_CODE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";

interface ModalPixProps {
  valor: number;
  onConfirmar: () => void;
  onFechar: () => void;
}

export const ModalPix: React.FC<ModalPixProps> = ({
  valor,
  onConfirmar,
  onFechar,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [processando, setProcessando] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(
      "00020126330014BR.GOV.BCB.PIX011112345678901..."
    );
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSimularPagamento = async () => {
    setProcessando(true);
    setTimeout(() => {
      onConfirmar();
      setProcessando(false);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-pix-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-pix">
          <h2 className="pix-titulo">Pagamento via Pix</h2>
          <p className="pix-subtitulo">
            Confirme o pagamento para liberar o saldo instantaneamente.
          </p>
        </div>

        <div className="pix-layout-grid">
          {/* LADO ESQUERDO: QR CODE + CÁPSULA DE VALOR */}
          <div className="coluna-destaque">
            {/* Box do QR Code */}
            <div className="qr-card">
              <img src={QR_CODE_URL} alt="QR Code Pix" className="qr-img" />
            </div>

            {/* 👇 AQUI ESTÁ A MUDANÇA: A CÁPSULA VERDE IGUAL À FOTO */}
            <div className="pix-valor-pill">
              Total: {normalizarDinheiro(valor)}
            </div>

            <span className="scan-hint">
              <FaQrcode /> Escaneie com o App do Banco
            </span>
          </div>

          {/* LADO DIREITO: AÇÕES */}
          <div className="coluna-acoes">
            <div className="instrucoes-lista">
              <p>
                <strong>1.</strong> Abra o aplicativo do seu banco.
              </p>
              <p>
                <strong>2.</strong> Escolha pagar via Pix com QR Code.
              </p>
              <p>
                <strong>3.</strong> Ou use o código Copia e Cola abaixo.
              </p>
            </div>

            <div className="divisoria">
              <span>OU</span>
            </div>

            <div className="grupo-input">
              <label>Pix Copia e Cola</label>
              <div className="input-wrapper-pix">
                <input
                  type="text"
                  readOnly
                  value="00020126330014BR.GOV.BCB.PIX0111..."
                />
                <button
                  className={`btn-copiar-icon ${copiado ? "sucesso" : ""}`}
                  onClick={handleCopiar}
                  title="Copiar código"
                >
                  {copiado ? <FaCheckCircle /> : <FaCopy />}
                </button>
              </div>
              {copiado && <span className="msg-copiado">Código copiado!</span>}
            </div>

            <div className="area-botao-final">
              <BotaoTexto
                texto={
                  processando ? "Verificando..." : "Já realizei o pagamento"
                }
                corFundo={processando ? "#CFD8DC" : "#4CAF50"}
                corBorda={processando ? "#CFD8DC" : "#4CAF50"}
                corTexto={processando ? "#546E7A" : "#fff"}
                onClick={handleSimularPagamento}
              />
              <div className="seguranca-badge">
                <FaShieldAlt /> Ambiente seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
