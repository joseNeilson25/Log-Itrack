export type ShipmentStatus =
  | 'AGUARDANDO'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type HistoricoStatus = {
  status: ShipmentStatus;
  data: string;
};

export type Remessa = {
  id: string;
  clienteId: string;
  origem: string;
  destino: string;
  pesoKg: number;
  descricao: string;
  status: ShipmentStatus;
  criadoEm: string;
  historico: HistoricoStatus[];
};

export type CriarRemessaArgs = {
  clienteId?: string;
  origem?: string;
  destino?: string;
  pesoKg?: number | string;
  descricao?: string;
};

export type ConsultarRemessaArgs = {
  remessaId?: string;
};

export type AtualizarStatusArgs = {
  remessaId?: string;
  status?: string;
};

export type ListarRemessasArgs = {
  status?: string;
  clienteId?: string;
  pagina?: number | string;
  tamanhoPagina?: number | string;
};