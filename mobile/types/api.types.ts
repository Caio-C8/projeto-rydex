// ==========================================
// RESPOSTAS PADRÃO (Wrapper)
// ==========================================

export interface RespostaBase {
  sucesso: boolean;
  status: number;
  mensagem: string;
}

export interface RespostaSucesso<T> extends RespostaBase {
  sucesso: true;
  dados: T;
}

export interface RespostaErro extends RespostaBase {
  sucesso: false;
  dados?: null;
  erros: string[] | object | null;
}

export type RespostaApi<T> = RespostaSucesso<T> | RespostaErro;

// ==========================================
// ENUMS
// ==========================================

export type StatusEntregadores =
  | "offline"
  | "online"
  | "em_entrega"
  | "bloqueado";

export type StatusSolicitacoes =
  | "pendente"
  | "atribuida"
  | "finalizada"
  | "cancelada";

export type StatusEntregas = "em_andamento" | "finalizada" | "cancelada";

// ==========================================
// MODELS (Baseados nos Resposta...Dto)
// ==========================================

// Baseado em: RespostaArquivosDto
export interface Arquivo {
  id: number;
  nome: string;
  caminho: string;
  entregador_id: number | null;
}

// Baseado em: RespostaEntregadorDto (Usado em /entregadores/me, /entregadores/:id)
export interface EntregadorPerfil {
  id: number;
  nome: string;
  data_nascimento: string; // Backend devolve ISO Date String
  cpf: string;
  email: string;
  saldo: number;
  celular: string;
  status: StatusEntregadores;
  placa_veiculo: string;
  latitude: number | null;
  longitude: number | null;
  ultima_atualizacao_localizacao: string | null; // Atenção: snake_case aqui
  chave_pix: string;
  arquivos: Arquivo[];
}

// Baseado em: UsuarioLoginRespostaDto (Dentro de RespostaLoginDto)
export interface UsuarioLogin {
  id: number;
  email: string;
  tipo: "empresa" | "entregador";
  latitude: number | null;
  longitude: number | null;
  ultimaAtualizacaoLocalizacao: string | null; // Atenção: camelCase aqui (conforme teu DTO de login)
}

// Baseado em: RespostaLoginDto
export interface LoginResponse {
  access_token: string;
  usuario: UsuarioLogin;
}

// ==========================================
// OUTROS TIPOS (Entregas, Websocket, etc.)
// ==========================================

export interface Entrega {
  id: number;
  valor_entrega: number;
  aceito_em?: string | null;
  criado_em: string;
  cancelado_em?: string | null;
  status: StatusEntregas;
  solicitacao_entrega_id: number;
  entregador_id: number;

  // Dependendo do include do Prisma, pode vir ou não
  solicitacao_entrega?: SolicitacaoEntrega;
}

export interface SolicitacaoEntrega {
  id: number;
  valor_estimado: number;
  valor_entregador: number;
  distancia_m?: number | null;
  item_retorno: boolean;
  descricao_item_retorno?: string | null;
  observacao?: string | null;
  status: StatusSolicitacoes;

  // Endereço
  cep: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: number;
  complemento?: string | null;
  ponto_referencia?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  empresa: {
    id: number;
    nome_empresa: string;
    // ... outros campos da empresa se necessário
  };
}

export interface NotificacaoSolicitacaoDto {
  id: number;
  valor_entregador: number; // em centavos
  distancia_m: number;
  item_retorno: boolean;
  observacao?: string;

  // Endereço do Cliente (Destino)
  logradouro: string;
  numero: number;
  bairro: string;
  latitude?: number;
  longitude?: number;

  // Dados da Empresa (Origem)
  empresa: {
    id: number;
    nome_empresa: string;
    logradouro: string;
    numero: number;
    bairro: string;
    latitude: number;
    longitude: number;
  };
}
