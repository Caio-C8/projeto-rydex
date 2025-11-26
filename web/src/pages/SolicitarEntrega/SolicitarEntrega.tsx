import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { ModalEndereco } from "../../components/ModalEndereco/ModalEndereco";
import { ModalConfirmacaoEntrega } from "../../components/ModalConfirmacaoEntrega/ModalConfirmacaoEntrega";
import { empresasService } from "../../services/empresasService";

import Input from "../../components/ui/Input/Input";
import BotaoTexto from "../../components/ui/Botao/BotaoTexto";
import Card from "../../components/ui/Card/Card";
import {
  FaMapMarkerAlt,
  FaBoxOpen,
  FaExchangeAlt,
  FaMapMarkedAlt,
} from "react-icons/fa";
import "./SolicitarEntrega.css";

export function SolicitarEntrega() {
  const navigate = useNavigate();

  // Estados de Loading
  const [simulando, setSimulando] = useState(false);
  const [criando, setCriando] = useState(false);

  const [form, setForm] = useState({
    cep: "",
    cidade: "",
    numero: "",
    bairro: "",
    logradouro: "",
    complemento: "",
    ponto_referencia: "",
    item_retorno: false,
    descricao_item_retorno: "",
    observacao: "",
  });

  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Estado que controla o novo Modal de Confirmação
  const [dadosConfirmacao, setDadosConfirmacao] = useState<{
    valor: number;
    distancia: number;
    motoboys: number;
    tempo: number;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleRetorno = () => {
    setForm((prev) => ({ ...prev, item_retorno: !prev.item_retorno }));
  };

  const handleEnderecoConfirmado = (enderecoMapa: any) => {
    setForm((prev) => ({
      ...prev,
      logradouro: enderecoMapa.logradouro || "",
      bairro: enderecoMapa.bairro || "",
      cidade: enderecoMapa.cidade || "",
      cep: enderecoMapa.cep || "",
      numero: enderecoMapa.numero || prev.numero || "",
    }));
    setMostrarMapa(false);
    toast.success("📍 Endereço preenchido pelo mapa!");
  };

  // --- PASSO 1: SIMULAR (Botão Principal da Tela) ---
  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.cep || !form.logradouro || !form.numero || !form.cidade) {
      toast.warning("⚠️ Preencha o endereço completo.");
      return;
    }

    setSimulando(true);

    try {
      // Lógica de limpeza: remove letras e garante que seja número (Int)
      // Ex: "100A" vira 100, "S/N" vira 0
      const numeroLimpo = Number(String(form.numero).replace(/\D/g, "")) || 0;
      const cepLimpo = form.cep.replace(/\D/g, "");

      const payload = {
        ...form,
        numero: numeroLimpo,
        cep: cepLimpo,
        complemento: form.complemento || "",
        ponto_referencia: form.ponto_referencia || "",
        observacao: form.observacao || "",
        descricao_item_retorno: form.item_retorno
          ? form.descricao_item_retorno
          : "",
      };

      console.log("🚀 [DEBUG] ENVIANDO PAYLOAD:", payload);

      const resultado = await empresasService.simularSolicitacao(payload);

      console.log("✅ [DEBUG] RESPOSTA RECEBIDA:", resultado);

      // 👇 CORREÇÃO FINAL: Acessa .dados se existir, senão usa o objeto direto
      const dadosReais = resultado.dados || resultado;

      setDadosConfirmacao({
        valor: dadosReais.valor_estimado ?? 0,
        distancia: dadosReais.distancia_m ?? 0,
        motoboys: dadosReais.entregadores_online ?? 0,
        tempo: dadosReais.tempo_seg ?? 0,
      });
    } catch (error: any) {
      console.error("❌ [DEBUG] ERRO NA REQUISIÇÃO:", error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        const msgFinal = Array.isArray(msg) ? msg[0] : msg;
        toast.error(`❌ ${msgFinal}`);
      } else {
        toast.error("❌ Erro ao calcular rota. Tente novamente.");
      }
    } finally {
      setSimulando(false);
    }
  };

  // --- PASSO 2: CONFIRMAR (Dentro do Modal) ---
  const handleConfirmarFinal = async () => {
    setCriando(true);

    try {
      // Mesma limpeza aqui para garantir consistência
      const numeroLimpo = Number(String(form.numero).replace(/\D/g, "")) || 0;

      const payload = {
        ...form,
        numero: numeroLimpo,
        cep: form.cep.replace(/\D/g, ""),
        complemento: form.complemento || "",
        ponto_referencia: form.ponto_referencia || "",
        observacao: form.observacao || "",
        descricao_item_retorno: form.item_retorno
          ? form.descricao_item_retorno
          : "",
      };

      console.log("🚀 [DEBUG] CRIANDO ENTREGA REAL:", payload);

      await empresasService.criarSolicitacao(payload);

      toast.success("✅ Solicitação criada com sucesso!");
      setDadosConfirmacao(null); // Fecha o modal
      setTimeout(() => navigate("/"), 1500); // Redireciona para a home
    } catch (error: any) {
      console.error("❌ [DEBUG] ERRO AO CRIAR:", error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        toast.error(`❌ ${Array.isArray(msg) ? msg[0] : msg}`);
      } else {
        toast.error("❌ Erro ao confirmar pedido.");
      }
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="solicitar-container">
      {mostrarMapa && (
        <ModalEndereco
          onFechar={() => setMostrarMapa(false)}
          onConfirmar={handleEnderecoConfirmado}
        />
      )}

      {dadosConfirmacao && (
        <ModalConfirmacaoEntrega
          onFechar={() => setDadosConfirmacao(null)}
          onConfirmar={handleConfirmarFinal}
          dadosSimulacao={dadosConfirmacao}
          dadosEndereco={{
            logradouro: form.logradouro,
            numero: String(form.numero), // Mostra o número original (com letras se houver) para o usuário
            bairro: form.bairro,
            cidade: form.cidade,
          }}
          carregando={criando}
        />
      )}

      <div className="solicitar-form-wrapper">
        <Card>
          <form onSubmit={handleSimular} className="form-entrega">
            {/* SEÇÃO ENDEREÇO */}
            <div className="form-section">
              <div className="section-header-row">
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  <FaMapMarkerAlt className="icon-orange" /> Endereço
                </h3>
                <button
                  type="button"
                  className="btn-buscar-mapa"
                  onClick={() => setMostrarMapa(true)}
                >
                  <FaMapMarkedAlt /> Mapa
                </button>
              </div>

              <div className="form-row row-cep-cidade">
                <div className="col-cep">
                  <Input
                    label="CEP *"
                    name="cep"
                    value={form.cep}
                    onChange={handleChange}
                    mask="00000-000"
                    placeholder="00000-000"
                  />
                </div>
                <div className="col-cidade">
                  <Input
                    label="Cidade *"
                    name="cidade"
                    value={form.cidade}
                    onChange={handleChange}
                    placeholder="Cidade"
                  />
                </div>
              </div>

              <div className="form-row row-logradouro">
                <div className="col-rua">
                  <Input
                    label="Logradouro *"
                    name="logradouro"
                    value={form.logradouro}
                    onChange={handleChange}
                    placeholder="Nome da rua"
                  />
                </div>
                <div className="col-num">
                  <Input
                    label="Nº *"
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="col-half">
                  <Input
                    label="Bairro *"
                    name="bairro"
                    value={form.bairro}
                    onChange={handleChange}
                    placeholder="Bairro"
                  />
                </div>
                <div className="col-half">
                  <Input
                    label="Complemento"
                    name="complemento"
                    value={form.complemento}
                    onChange={handleChange}
                    placeholder="Apto, Bloco..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="col-full">
                  <Input
                    label="Ponto de Referência"
                    name="ponto_referencia"
                    value={form.ponto_referencia}
                    onChange={handleChange}
                    placeholder="Ex: Ao lado da padaria..."
                  />
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* SEÇÃO DETALHES */}
            <div className="form-section">
              <h3 className="section-title">
                <FaBoxOpen className="icon-orange" /> Detalhes
              </h3>
              <div className="form-row">
                <div className="col-full">
                  <Input
                    label="Observação"
                    name="observacao"
                    value={form.observacao}
                    onChange={handleChange}
                    placeholder="Ex: Caixa frágil..."
                  />
                </div>
              </div>

              <div className="retorno-container">
                <div className="retorno-header" onClick={handleToggleRetorno}>
                  <div
                    className={`checkbox-fake ${
                      form.item_retorno ? "checked" : ""
                    }`}
                  >
                    {form.item_retorno && <FaExchangeAlt />}
                  </div>
                  <div className="retorno-label">
                    <strong>Trazer algo de volta?</strong>
                  </div>
                </div>
                {form.item_retorno && (
                  <div className="retorno-input anime-slide-down">
                    <Input
                      label="Descrição do retorno"
                      name="descricao_item_retorno"
                      value={form.descricao_item_retorno}
                      onChange={handleChange}
                      placeholder="Ex: Contrato..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* BOTÃO ÚNICO: CALCULAR E CONFIRMAR */}
            <div className="btn-solicitar-entrega">
              <BotaoTexto
                texto={
                  simulando ? "CALCULANDO ROTA..." : "CONTINUAR PARA PAGAMENTO"
                }
                type="submit"
                corFundo="#FF5722"
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
