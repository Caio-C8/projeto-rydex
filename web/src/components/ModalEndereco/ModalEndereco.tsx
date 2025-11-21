import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import BotaoTexto from "../ui/Botao/BotaoTexto";
import "leaflet/dist/leaflet.css";
import "./ModalEndereco.css";

// --- CORREÇÃO DE ÍCONES DO LEAFLET (BUG CONHECIDO NO REACT) ---
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- TIPOS ---
interface EnderecoMap {
  logradouro: string;
  bairro: string;
  cidade: string;
  cep: string;
  numero?: string;
}

interface ModalEnderecoProps {
  onFechar: () => void;
  // Agora o confirmar devolve o endereço completo achado no mapa
  onConfirmar: (endereco: EnderecoMap) => void;
}

// Componente auxiliar para capturar o clique no mapa
const CliqueNoMapa = ({
  aoClicar,
}: {
  aoClicar: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      aoClicar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const ModalEndereco: React.FC<ModalEnderecoProps> = ({
  onFechar,
  onConfirmar,
}) => {
  const [posicao, setPosicao] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [enderecoDetectado, setEnderecoDetectado] = useState<string>("");
  const [dadosEndereco, setDadosEndereco] = useState<EnderecoMap | null>(null);
  const [loading, setLoading] = useState(false);

  // Função mágica: Transforma Latitude/Longitude em Rua/Bairro
  const handleMapClick = async (lat: number, lng: number) => {
    setPosicao({ lat, lng });
    setLoading(true);
    setEnderecoDetectado("Buscando endereço...");

    try {
      // Usa a API gratuita Nominatim (OpenStreetMap)
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      if (res.data && res.data.address) {
        const addr = res.data.address;

        const novoEndereco: EnderecoMap = {
          logradouro: addr.road || addr.pedestrian || addr.street || "",
          bairro: addr.suburb || addr.neighbourhood || addr.residential || "",
          cidade: addr.city || addr.town || addr.municipality || "",
          cep: addr.postcode || "",
          // Tenta achar o número, senão deixa vazio para o usuário preencher
          numero: addr.house_number || "",
        };

        setDadosEndereco(novoEndereco);
        setEnderecoDetectado(
          `${novoEndereco.logradouro}, ${novoEndereco.numero || "S/N"} - ${
            novoEndereco.bairro
          }`
        );
      } else {
        setEnderecoDetectado(
          "Endereço não identificado neste ponto. Tente outro local."
        );
        setDadosEndereco(null);
      }
    } catch (error) {
      setEnderecoDetectado("Erro ao buscar endereço. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-mapa">
      <div className="modal-mapa-content">
        <div className="mapa-header">
          <h3>Selecione sua localização exata</h3>
          <button onClick={onFechar} className="btn-close">
            <FaTimes />
          </button>
        </div>

        <div className="mapa-wrapper">
          <MapContainer
            center={[-15.79, -47.88]} // Centro do Brasil (Podes mudar para tua cidade padrão)
            zoom={4}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <CliqueNoMapa aoClicar={handleMapClick} />
            {posicao && <Marker position={[posicao.lat, posicao.lng]} />}
          </MapContainer>
        </div>

        <div className="mapa-footer">
          <div className="info-selecao">
            <FaMapMarkerAlt className="icon-pin" />
            <p>
              {enderecoDetectado ||
                "Clique no mapa para marcar onde é a empresa"}
            </p>
          </div>

          <div className="btn-confirmar-mapa">
            <BotaoTexto
              texto={loading ? "BUSCANDO..." : "USAR ESTE ENDEREÇO"}
              corFundo={dadosEndereco ? "#FF5722" : "#ccc"}
              // Só confirma se tiver achado um endereço válido
              onClick={() => dadosEndereco && onConfirmar(dadosEndereco)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
