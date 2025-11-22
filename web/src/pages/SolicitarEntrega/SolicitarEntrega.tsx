import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Importante para redirecionar
import axios from 'axios';

import { ModalEndereco } from '../../components/ModalEndereco/ModalEndereco'; 
import { empresasService } from '../../services/empresasService'; // Importa o serviço

import Input from '../../components/ui/Input/Input';
import BotaoTexto from '../../components/ui/Botao/BotaoTexto';
import Card from '../../components/ui/Card/Card';
import { FaMapMarkerAlt, FaBoxOpen, FaExchangeAlt, FaMapMarkedAlt } from 'react-icons/fa';
import './SolicitarEntrega.css';

export function SolicitarEntrega() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false); // Estado de loading para o botão

  const [form, setForm] = useState({
    cep: '',
    cidade: '',
    numero: '',
    bairro: '',
    logradouro: '',
    complemento: '',
    ponto_referencia: '',
    item_retorno: false,
    descricao_item_retorno: '',
    observacao: ''
  });

  const [mostrarMapa, setMostrarMapa] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleRetorno = () => {
    setForm(prev => ({ ...prev, item_retorno: !prev.item_retorno }));
  };

  const handleEnderecoConfirmado = (enderecoMapa: any) => {
    setForm(prev => ({
      ...prev,
      logradouro: enderecoMapa.logradouro,
      bairro: enderecoMapa.bairro,
      cidade: enderecoMapa.cidade,
      cep: enderecoMapa.cep,
      numero: enderecoMapa.numero || prev.numero
    }));
    setMostrarMapa(false);
    toast.success("📍 Endereço preenchido pelo mapa!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validações
    if (!form.cep || !form.logradouro || !form.numero || !form.bairro || !form.cidade) {
      toast.warning("⚠️ Preencha os campos de endereço obrigatórios (*)");
      return;
    }

    if (form.item_retorno && !form.descricao_item_retorno) {
      toast.warning("⚠️ Descreva o item que deve retornar.");
      return;
    }

    setCarregando(true);

    try {
      // 2. Prepara o Payload
      const payload = {
        ...form,
        numero: Number(form.numero), // Converte para número
        cep: form.cep.replace(/\D/g, ''), // Limpa formatação do CEP
        // Garante que campos opcionais vazios não vão como "undefined"
        complemento: form.complemento || '',
        ponto_referencia: form.ponto_referencia || '',
        observacao: form.observacao || '',
        descricao_item_retorno: form.item_retorno ? form.descricao_item_retorno : ''
      };

      console.log("📤 Enviando Solicitação:", payload);

      // 3. Chama o Backend
      await empresasService.criarSolicitacao(payload);
      
      // 4. Sucesso
      toast.success("✅ Solicitação criada com sucesso!");
      
      // Redireciona para a Home (onde aparecem as entregas ativas)
      setTimeout(() => navigate('/home'), 1500);

    } catch (error: any) {
      console.error("Erro ao solicitar:", error);
      
      // 5. Tratamento de Erros (Saldo insuficiente, endereço inválido, etc)
      if (error.response) {
        const { data, status } = error.response;
        const msgBackend = data.message;

        if (msgBackend) {
          const msgFinal = Array.isArray(msgBackend) ? msgBackend[0] : msgBackend;
          toast.error(`❌ ${msgFinal}`);
        } else if (status === 400) {
          toast.error("❌ Dados inválidos. Verifique o endereço ou saldo.");
        } else {
          toast.error("❌ Erro no servidor. Tente novamente.");
        }
      } else {
        toast.error("❌ Erro de conexão.");
      }
    } finally {
      setCarregando(false);
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

      <div className="solicitar-header">
        <h1 className="solicitar-titulo">Nova Solicitação de Entrega</h1>
        <p className="solicitar-subtitulo">Preencha os dados para chamar um entregador</p>
      </div>

      <div className="solicitar-form-wrapper">
        <Card>
          <form onSubmit={handleSubmit} className="form-entrega">
            
            {/* ... SEÇÃO ENDEREÇO IGUAL AO ANTERIOR ... */}
            <div className="form-section">
              <div className="section-header-row">
                <h3 className="section-title" style={{marginBottom: 0}}>
                  <FaMapMarkerAlt className="icon-orange" /> Endereço de Entrega
                </h3>
                <button 
                  type="button"
                  className="btn-buscar-mapa"
                  onClick={() => setMostrarMapa(true)}
                  title="Selecionar no mapa"
                >
                  <FaMapMarkedAlt /> Buscar no Mapa
                </button>
              </div>
              
              <div className="form-row row-cep-cidade">
                <div className="col-cep">
                  <Input label="CEP *" name="cep" value={form.cep} onChange={handleChange} mask="00000-000" placeholder="00000-000" />
                </div>
                <div className="col-cidade">
                  <Input label="Cidade *" name="cidade" value={form.cidade} onChange={handleChange} placeholder="Cidade" />
                </div>
              </div>

              <div className="form-row row-logradouro">
                <div className="col-rua">
                  <Input label="Logradouro (Rua, Av...) *" name="logradouro" value={form.logradouro} onChange={handleChange} placeholder="Nome da rua" />
                </div>
                <div className="col-num">
                  <Input label="Nº *" name="numero" value={form.numero} onChange={handleChange} placeholder="123" />
                </div>
              </div>

              <div className="form-row">
                <div className="col-half">
                  <Input label="Bairro *" name="bairro" value={form.bairro} onChange={handleChange} placeholder="Bairro" />
                </div>
                <div className="col-half">
                  <Input label="Complemento" name="complemento" value={form.complemento} onChange={handleChange} placeholder="Apto, Bloco..." />
                </div>
              </div>

              <div className="form-row">
                <div className="col-full">
                  <Input label="Ponto de Referência" name="ponto_referencia" value={form.ponto_referencia} onChange={handleChange} placeholder="Ex: Ao lado da padaria..." />
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* ... SEÇÃO DETALHES IGUAL AO ANTERIOR ... */}
            <div className="form-section">
              <h3 className="section-title">
                <FaBoxOpen className="icon-orange" /> Detalhes do Pedido
              </h3>

              <div className="form-row">
                <div className="col-full">
                  <Input label="Observação (O que está sendo enviado?)" name="observacao" value={form.observacao} onChange={handleChange} placeholder="Ex: Caixa frágil, Documentos..." />
                </div>
              </div>

              <div className="retorno-container">
                <div className="retorno-header" onClick={handleToggleRetorno}>
                  <div className={`checkbox-fake ${form.item_retorno ? 'checked' : ''}`}>
                    {form.item_retorno && <FaExchangeAlt />}
                  </div>
                  <div className="retorno-label">
                    <strong>É necessário trazer algo de volta?</strong>
                    <p>Marque se o entregador precisa retornar à empresa</p>
                  </div>
                </div>

                {form.item_retorno && (
                  <div className="retorno-input anime-slide-down">
                    <Input label="O que ele deve trazer de volta?" name="descricao_item_retorno" value={form.descricao_item_retorno} onChange={handleChange} placeholder="Ex: Maquininha, Contrato..." />
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <BotaoTexto 
                texto={carregando ? "CALCULANDO E ENVIANDO..." : "SOLICITAR ENTREGADOR"} 
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