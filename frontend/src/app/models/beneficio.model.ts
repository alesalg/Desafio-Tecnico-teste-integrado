export interface Beneficio {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  ativo: boolean;
  version: number;
}

export interface BeneficioRequest {
  nome: string;
  descricao: string;
  valor: number;
  ativo: boolean;
}

export interface TransferenciaRequest {
  fromId: number;
  toId: number;
  valor: number;
}

export interface TransferenciaResponse {
  fromId: number;
  fromNome: string;
  fromNovoSaldo: number;
  toId: number;
  toNome: string;
  toNovoSaldo: number;
  valorTransferido: number;
  dataHora: string;
  mensagem: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}
