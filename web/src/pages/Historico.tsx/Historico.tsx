import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card/Card';
import { normalizarDinheiro } from '../../utils/normalizar-dinheiro';
import { authService } from '../../services/authService';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaBox, 
  FaCalendarAlt, 
  FaChevronDown, 
  FaChevronUp, 
  FaInfoCircle,
  FaTimes,
  FaMotorcycle
} from 'react-icons/fa';
import './Historico.css';

// Tipagem atualizada para incluir dados do entregador e da entrega real
interface Solicitacao {
  id: number;
  valor_estimado: number;
  status: string;
  criado_em: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  distancia_m: number;
  observacao?: string;
  descricao_item_retorno?: string;
  item_retorno: boolean;
  // Dados que vêm do relacionamento (include) do Prisma
  entregador?: {
    nome: string;
    placa_veiculo: string;
  };
  entrega?: {
    aceito_em: string;
    finalizado_em: string;
  };
}

interface GrupoHistorico {
  data: string;
  items: Solicitacao[];
}

export function Historico() {
  const [grupos, setGrupos] = useState<GrupoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  const [diasExpandidos, setDiasExpandidos] = useState<Record<string, boolean>>({});

  const [entregaSelecionada, setEntregaSelecionada] = useState<Solicitacao | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/solicitacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const lista = response.data.dados || response.data;
      agruparPorData(Array.isArray(lista) ? lista : []);
      
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setErro("Não foi possível carregar o histórico.");
    } finally {
      setLoading(false);
    }
  };

  const agruparPorData = (lista: Solicitacao[]) => {
    const gruposTemp: Record<string, Solicitacao[]> = {};
    const expansaoInicial: Record<string, boolean> = {};

    lista.forEach(item => {
      const dataObj = new Date(item.criado_em);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      
      if (!gruposTemp[dataFormatada]) {
        gruposTemp[dataFormatada] = [];
        expansaoInicial[dataFormatada] = true;
      }
      gruposTemp[dataFormatada].push(item);
    });

    const arrayGrupos = Object.keys(gruposTemp).map(data => ({
      data,
      items: gruposTemp[data]
    }));

    setGrupos(arrayGrupos);
    setDiasExpandidos(expansaoInicial);
  };

  const toggleDia = (data: string) => {
    setDiasExpandidos(prev => ({
      ...prev,
      [data]: !prev[data] 
    }));
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pendente': return '#FFC107';
      case 'atribuida': 
      case 'aceita': return '#2196F3';
      case 'em_andamento': return '#FF9800';
      case 'concluida': return '#4CAF50';
      case 'cancelada': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="historico-container">
      <div className="historico-header">
        <h1 className="historico-titulo">Histórico de Entregas</h1>
      </div>

      {loading ? (
        <div className="historico-loading"><p>Carregando suas entregas...</p></div>
      ) : erro ? (
        <div className="historico-erro"><p>{erro}</p></div>
      ) : grupos.length === 0 ? (
        <div className="historico-vazio">
          <div className="vazio-icon">📦</div>
          <h3>Nenhuma entrega encontrada</h3>
        </div>
      ) : (
        <div className="timeline">
          {grupos.map((grupo) => (
            <div key={grupo.data} className="grupo-dia">
              
              {/* --- CABEÇALHO DO DIA (Clicável) --- */}
              <div 
                className="data-separator" 
                onClick={() => toggleDia(grupo.data)}
              >
                <div className="data-info">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>{grupo.data}</span>
                  <span className="qtd-items">({grupo.items.length})</span>
                </div>
                {/* Seta muda dependendo se está aberto ou fechado */}
                {diasExpandidos[grupo.data] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {/* --- LISTA DE CARDS (Só mostra se estiver expandido) --- */}
              {diasExpandidos[grupo.data] && (
                <div className="lista-cards anime-fade-in">
                  {grupo.items.map((entrega) => (
                    <Card key={entrega.id} isPointer={false}>
                      <div className="card-entrega-content">
                        
                        <div className="entrega-header">
                          <span className="entrega-id">Pedido #{entrega.id}</span>
                          <span 
                            className="entrega-status" 
                            style={{ backgroundColor: getStatusColor(entrega.status) }}
                          >
                            {entrega.status ? entrega.status.toUpperCase().replace('_', ' ') : 'DESCONHECIDO'}
                          </span>
                        </div>

                        <div className="entrega-info">
                          <div className="info-row">
                            <FaMapMarkerAlt className="icon-laranja" />
                            <p className="endereco-texto">
                              {entrega.logradouro}, {entrega.numero} - {entrega.bairro}
                            </p>
                          </div>
                        </div>

                        <div className="entrega-footer">
                          <span className="entrega-valor">
                            {normalizarDinheiro(entrega.valor_estimado)}
                          </span>
                          
                          {/* --- BOTÃO VER DETALHES --- */}
                          <button 
                            className="btn-detalhes"
                            onClick={() => setEntregaSelecionada(entrega)}
                          >
                            <FaInfoCircle /> Detalhes
                          </button>
                        </div>

                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE DETALHES --- */}
      {entregaSelecionada && (
        <div className="modal-overlay" onClick={() => setEntregaSelecionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>Detalhes do Pedido #{entregaSelecionada.id}</h2>
              <button className="modal-close" onClick={() => setEntregaSelecionada(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {/* Seção 1: Status e Valor */}
              <div className="modal-section destaque">
                <div className="modal-status-badge" style={{ backgroundColor: getStatusColor(entregaSelecionada.status) }}>
                  {entregaSelecionada.status.toUpperCase()}
                </div>
                <div className="modal-valor">
                  {normalizarDinheiro(entregaSelecionada.valor_estimado)}
                </div>
              </div>

              {/* Seção 2: Endereço Completo */}
              <div className="modal-section">
                <h4 className="modal-label">Endereço de Entrega</h4>
                <p className="modal-texto">
                  {entregaSelecionada.logradouro}, {entregaSelecionada.numero}
                </p>
                <p className="modal-subtexto">
                  {entregaSelecionada.bairro} - {entregaSelecionada.cidade}
                </p>
                <p className="modal-subtexto">Distância: {(entregaSelecionada.distancia_m / 1000).toFixed(1)} km</p>
              </div>

              {/* Seção 3: Dados do Entregador (Se houver) */}
              {entregaSelecionada.entregador ? (
                <div className="modal-section entregador-box">
                  <h4 className="modal-label"><FaMotorcycle /> Entregador</h4>
                  <p className="modal-texto-bold">{entregaSelecionada.entregador.nome}</p>
                  <p className="modal-subtexto">Veículo: {entregaSelecionada.entregador.placa_veiculo}</p>
                </div>
              ) : (
                <div className="modal-section">
                  <p className="modal-aviso">Aguardando entregador...</p>
                </div>
              )}

              {/* Seção 4: Detalhes Extras */}
              <div className="modal-section">
                <h4 className="modal-label">Observações</h4>
                <p className="modal-texto">{entregaSelecionada.observacao || "Nenhuma observação."}</p>
                
                {entregaSelecionada.item_retorno && (
                  <div className="retorno-box">
                    <strong>⚠️ Item de Retorno:</strong> {entregaSelecionada.descricao_item_retorno}
                  </div>
                )}
              </div>

              {/* Seção 5: Horários */}
              <div className="modal-section horarios">
                <div className="horario-item">
                  <span>Criado em:</span>
                  <strong>{new Date(entregaSelecionada.criado_em).toLocaleString('pt-BR')}</strong>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}