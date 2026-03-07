export interface Benefit {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  ativo: boolean;
  version: number;
}

export interface BenefitRequest {
  nome: string;
  descricao: string;
  valor: number;
  ativo: boolean;
}

export interface TransferRequest {
  fromId: number;
  toId: number;
  valor: number;
}

export interface TransferResponse {
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
