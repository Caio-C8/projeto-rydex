import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card/Card';
import { normalizarDinheiro } from '../../utils/normalizar-dinheiro';
import { authService } from '../../services/authService';
import { 
  FaMapMarkerAlt, FaClock, FaBox, FaCalendarAlt, 
  FaChevronDown, FaChevronUp, FaInfoCircle, FaTimes, FaMotorcycle, FaFilter
} from 'react-icons/fa';
import './Historico.css';

// ... (Interfaces mantêm-se iguais)
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
  entregador?: { nome: string; placa_veiculo: string; };
  entrega?: { aceito_em: string; finalizado_em: string; };
}

interface GrupoHistorico {
  data: string;
  items: Solicitacao[];
}

export function Historico() {
  const [listaCompleta, setListaCompleta] = useState<Solicitacao[]>([]); // Guarda tudo
  const [grupos, setGrupos] = useState<GrupoHistorico[]>([]); // O que é exibido
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [diasExpandidos, setDiasExpandidos] = useState<Record<string, boolean>>({});
  const [entregaSelecionada, setEntregaSelecionada] = useState<Solicitacao | null>(null);

  // --- ESTADOS DOS FILTROS ---
  const [filtroData, setFiltroData] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroValorMin, setFiltroValorMin] = useState('');
  const [filtroValorMax, setFiltroValorMax] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false); // Para mobile/toggle

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchHistorico = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        window.location.href = '/'; 
        return;
      }

      const response = await axios.get(`${API_URL}/solicitacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const lista = response.data.dados || response.data;
      const arrayLista = Array.isArray(lista) ? lista : [];
      
      setListaCompleta(arrayLista); // Guarda a lista bruta
      aplicarFiltros(arrayLista);   // Aplica filtros iniciais (mostra tudo)
      setErro('');
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        authService.logout();
        return;
      }
      console.error("Erro ao buscar histórico:", error);
      setErro("Não foi possível carregar o histórico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
    const intervalo = setInterval(fetchHistorico, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Re-aplica filtros sempre que os critérios ou a lista mudarem
  useEffect(() => {
    aplicarFiltros(listaCompleta);
  }, [filtroData, filtroStatus, filtroValorMin, filtroValorMax]);

  const aplicarFiltros = (lista: Solicitacao[]) => {
    let filtrada = lista;

    // 1. Filtro de Data
    if (filtroData) {
      filtrada = filtrada.filter(item => {
        const dataItem = new Date(item.criado_em).toISOString().split('T')[0];
        return dataItem === filtroData;
      });
    }

    // 2. Filtro de Status
    if (filtroStatus !== 'todos') {
      filtrada = filtrada.filter(item => item.status.toLowerCase() === filtroStatus.toLowerCase());
    }

    // 3. Filtro de Valor Mínimo (converter centavos para reais no input)
    if (filtroValorMin) {
      const minCentavos = parseFloat(filtroValorMin) * 100;
      filtrada = filtrada.filter(item => item.valor_estimado >= minCentavos);
    }

    // 4. Filtro de Valor Máximo
    if (filtroValorMax) {
      const maxCentavos = parseFloat(filtroValorMax) * 100;
      filtrada = filtrada.filter(item => item.valor_estimado <= maxCentavos);
    }

    agruparPorData(filtrada);
  };

  const agruparPorData = (lista: Solicitacao[]) => {
    const gruposTemp: Record<string, Solicitacao[]> = {};
    const novaExpansao: Record<string, boolean> = { ...diasExpandidos };
    const isPrimeiraCarga = Object.keys(diasExpandidos).length === 0;

    lista.forEach(item => {
      const dataObj = new Date(item.criado_em);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      
      if (!gruposTemp[dataFormatada]) {
        gruposTemp[dataFormatada] = [];
        if (isPrimeiraCarga) novaExpansao[dataFormatada] = true;
      }
      gruposTemp[dataFormatada].push(item);
    });

    const arrayGrupos = Object.keys(gruposTemp).map(data => ({
      data,
      items: gruposTemp[data]
    }));

    setGrupos(arrayGrupos);
    if (isPrimeiraCarga) setDiasExpandidos(novaExpansao);
  };

  const toggleDia = (data: string) => {
    setDiasExpandidos(prev => ({ ...prev, [data]: !prev[data] }));
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pendente': return '#FFC107';
      case 'atribuida': case 'aceita': return '#2196F3';
      case 'em_andamento': return '#FF9800';
      case 'concluida': case 'finalizada': return '#4CAF50';
      case 'cancelada': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Lógica para mensagem do Entregador no Modal
  const renderStatusEntregador = (entrega: Solicitacao) => {
    if (entrega.entregador) {
      return (
        <div className="modal-section entregador-box">
          <h4 className="modal-label"><FaMotorcycle /> Entregador</h4>
          <p className="modal-texto-bold">{entrega.entregador.nome}</p>
          <p className="modal-subtexto">Veículo: {entrega.entregador.placa_veiculo}</p>
        </div>
      );
    }

    // Se não tem entregador, verifica o status
    let mensagem = "Aguardando entregador...";
    let classeExtra = "";

    switch(entrega.status?.toLowerCase()) {
      case 'cancelada':
        mensagem = "Esta entrega foi cancelada.";
        classeExtra = "aviso-cancelado";
        break;
      case 'concluida':
      case 'finalizada':
        mensagem = "Entrega finalizada (Entregador não registrado).";
        classeExtra = "aviso-sucesso";
        break;
      case 'pendente':
        mensagem = "Procurando entregadores na região...";
        break;
      default:
        mensagem = "Aguardando alocação de entregador.";
    }

    return (
      <div className="modal-section">
        <p className={`modal-aviso ${classeExtra}`}>{mensagem}</p>
      </div>
    );
  };

  return (
    <div className="historico-container">
      <div className="historico-header">
        <div className="header-top">
          <h1 className="historico-titulo">Histórico de Entregas</h1>
          <button 
            className={`btn-filtro ${mostrarFiltros ? 'ativo' : ''}`} 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <FaFilter /> Filtros
          </button>
        </div>

        {/* --- BARRA DE FILTROS --- */}
        {mostrarFiltros && (
          <div className="filtros-container anime-fade-in">
            <div className="filtro-item">
              <label>Data</label>
              <input 
                type="date" 
                value={filtroData} 
                onChange={(e) => setFiltroData(e.target.value)} 
              />
            </div>
            
            <div className="filtro-item">
              <label>Status</label>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="atribuida">Em Andamento / Atribuída</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="filtro-grupo-valor">
              <div className="filtro-item">
                <label>Valor Mín (R$)</label>
                <input 
                  type="number" 
                  placeholder="0,00" 
                  value={filtroValorMin} 
                  onChange={(e) => setFiltroValorMin(e.target.value)} 
                />
              </div>
              <div className="filtro-item">
                <label>Valor Máx (R$)</label>
                <input 
                  type="number" 
                  placeholder="100,00" 
                  value={filtroValorMax} 
                  onChange={(e) => setFiltroValorMax(e.target.value)} 
                />
              </div>
            </div>

            <div className="filtro-acoes">
              <button className="btn-limpar" onClick={() => {
                setFiltroData('');
                setFiltroStatus('todos');
                setFiltroValorMin('');
                setFiltroValorMax('');
              }}>Limpar Filtros</button>
            </div>
          </div>
        )}
      </div>

      {/* ... (LOADING, ERRO E LISTA MANTÊM-SE IGUAIS) ... */}
      {loading && grupos.length === 0 ? (
        <div className="historico-loading"><p>Carregando suas entregas...</p></div>
      ) : erro ? (
        <div className="historico-erro"><p>{erro}</p></div>
      ) : grupos.length === 0 ? (
        <div className="historico-vazio">
          <div className="vazio-icon">📦</div>
          <h3>Nenhuma entrega encontrada</h3>
          <p>Tente ajustar os filtros ou crie uma nova solicitação.</p>
        </div>
      ) : (
        <div className="timeline">
          {grupos.map((grupo) => (
            <div key={grupo.data} className="grupo-dia">
              <div className="data-separator" onClick={() => toggleDia(grupo.data)}>
                <div className="data-info">
                  <FaCalendarAlt className="calendar-icon" />
                  <span>{grupo.data}</span>
                  <span className="qtd-items">({grupo.items.length})</span>
                </div>
                {diasExpandidos[grupo.data] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {diasExpandidos[grupo.data] && (
                <div className="lista-cards anime-fade-in">
                  {grupo.items.map((entrega) => (
                    <Card key={entrega.id} isPointer={false}>
                      <div className="card-entrega-content">
                        <div className="entrega-header">
                          <span className="entrega-id">Pedido #{entrega.id}</span>
                          <span className="entrega-status" style={{ backgroundColor: getStatusColor(entrega.status) }}>
                            {entrega.status ? entrega.status.toUpperCase().replace('_', ' ') : 'DESCONHECIDO'}
                          </span>
                        </div>
                        <div className="entrega-info">
                          <div className="info-row">
                            <FaMapMarkerAlt className="icon-laranja" />
                            <p className="endereco-texto">{entrega.logradouro}, {entrega.numero} - {entrega.bairro}</p>
                          </div>
                        </div>
                        <div className="entrega-footer">
                          <span className="entrega-valor">{normalizarDinheiro(entrega.valor_estimado)}</span>
                          <button className="btn-detalhes" onClick={() => setEntregaSelecionada(entrega)}>
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

      {/* --- MODAL --- */}
      {entregaSelecionada && (
        <div className="modal-overlay" onClick={() => setEntregaSelecionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Pedido #{entregaSelecionada.id}</h2>
              <button className="modal-close" onClick={() => setEntregaSelecionada(null)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="modal-section destaque">
                <div className="modal-status-badge" style={{ backgroundColor: getStatusColor(entregaSelecionada.status) }}>
                  {entregaSelecionada.status.toUpperCase()}
                </div>
                <div className="modal-valor">{normalizarDinheiro(entregaSelecionada.valor_estimado)}</div>
              </div>
              
              <div className="modal-section">
                <h4 className="modal-label">Endereço de Entrega</h4>
                <p className="modal-texto">{entregaSelecionada.logradouro}, {entregaSelecionada.numero}</p>
                <p className="modal-subtexto">{entregaSelecionada.bairro} - {entregaSelecionada.cidade}</p>
                <p className="modal-subtexto">Distância: {(entregaSelecionada.distancia_m / 1000).toFixed(1)} km</p>
              </div>

              {/* AQUI ESTÁ A MUDANÇA: Lógica inteligente do Entregador */}
              {renderStatusEntregador(entregaSelecionada)}

              <div className="modal-section">
                <h4 className="modal-label">Observações</h4>
                <p className="modal-texto">{entregaSelecionada.observacao || "Nenhuma observação."}</p>
                {entregaSelecionada.item_retorno && (
                  <div className="retorno-box"><strong>⚠️ Item de Retorno:</strong> {entregaSelecionada.descricao_item_retorno}</div>
                )}
              </div>
              <div className="modal-section horarios">
                <div className="horario-item">
                  <span>Criado em:</span> <strong>{new Date(entregaSelecionada.criado_em).toLocaleString('pt-BR')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}