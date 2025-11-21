import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card/Card';
import { authService } from '../../services/authService';
import { normalizarDinheiro } from '../../utils/normalizar-dinheiro';
import { 
  FaPlus, 
  FaMapMarkerAlt, 
  FaClock, 
  FaArrowRight 
} from 'react-icons/fa';
import './Inicio.css';

import ilustracaoHome from '../../assets/logo-rydex.png'; 

interface Solicitacao {
  id: number;
  valor_estimado: number;
  status: string;
  criado_em: string;
  logradouro: string;
  numero: string;
  bairro: string;
  distancia_m: number;
  observacao?: string; // 👈 1. Adicionei este campo opcional
}

export function Inicio() {
  const [entregasAtivas, setEntregasAtivas] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchEntregas();
    const intervalo = setInterval(fetchEntregas, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const fetchEntregas = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/solicitacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const lista = response.data.dados || response.data || [];
      const arrayLista = Array.isArray(lista) ? lista : [];

      const ativas = arrayLista.filter((item: Solicitacao) => {
        const s = item.status.toLowerCase();
        return s === 'pendente' || s === 'atribuida' || s === 'em_andamento' || s === 'aceita';
      });

      setEntregasAtivas(ativas);
    } catch (error) {
      console.error("Erro ao buscar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pendente': return '#FFC107';
      case 'atribuida': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="inicio-container">
      <div className="inicio-content">
        
        {loading ? (
          <p className="inicio-loading">Carregando...</p>
        ) : entregasAtivas.length > 0 ? (
          <div className="lista-ativas">
            <h2 className="titulo-secao">Entregas em Andamento</h2>
            {entregasAtivas.map(entrega => (
              <Card key={entrega.id} isPointer={false}>
                <div className="card-inicio-content">
                  <div className="card-inicio-header">
                    
                    {/* 👈 2. MUDANÇA AQUI: Mostra Observação ou ID */}
                    <span className="badge-id" title={entrega.observacao || `Pedido #${entrega.id}`}>
                      {entrega.observacao 
                        ? entrega.observacao 
                        : `Pedido #${entrega.id}`
                      }
                    </span>

                    <span className="badge-status" style={{backgroundColor: getStatusColor(entrega.status)}}>
                      {entrega.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="card-inicio-info">
                    <p className="endereco">
                      <FaMapMarkerAlt className="icon-laranja"/> 
                      {entrega.logradouro}, {entrega.numero} - {entrega.bairro}
                    </p>
                    <div className="meta-info">
                      <span><FaClock className="icon-cinza"/> {new Date(entrega.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="valor">{normalizarDinheiro(entrega.valor_estimado)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state-convite">
            <div className="ilustracao-box">
              <img src={ilustracaoHome} alt="Ilustração" className="img-ilustracao" />
            </div>
            
            <h2 className="titulo-convite">Faça sua primeira solicitação de entrega!</h2>
            
            <div className="seta-container">
              <p className="texto-ajuda">Aperte o botão de <strong>+</strong> para começar</p>
              <FaArrowRight className="seta-indicativa" />
            </div>
          </div>
        )}

      </div>

      <button 
        className="fab-adicionar" 
        onClick={() => navigate('/solicitar-entrega')}
        title="Nova Entrega"
      >
        <FaPlus />
      </button>

    </div>
  );
}