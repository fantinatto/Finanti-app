export interface SimulacaoConfig {
  aporteSemanalValor: number;
  /** Valor apurado em vendas sem par de compra (categoria reducao_risco) — fica disponível até
   * ser reinvestido via "Investir caixa". */
  caixaDisponivel: number;
  ultimoAporteAplicadoEm: string | null;
  simulacaoIniciadaEm: string | null;
}

export interface UpsertSimulacaoConfigPayload {
  aporteSemanalValor: number;
}

export interface TransacaoSimulacao {
  id: string;
  anoMes: string;
  tipo: 'venda' | 'compra';
  ticker: string;
  quantidade: number;
  preco: number;
  valor: number;
  origem: 'recomendacao' | 'aporte_semanal' | 'reinicio' | 'caixa';
  motivo: string | null;
  createdAt: string;
}

export interface AplicarAporteResultado {
  semanasAplicadas: number;
  transacoes: TransacaoSimulacao[];
}

export interface InvestirCaixaResultado {
  valorInvestido: number;
  transacoes: TransacaoSimulacao[];
}

export interface HistoricoCarteira {
  id: string;
  carteira: 'real' | 'simulacao';
  anoMes: string;
  valorTotal: number;
  valorInvestidoTotal: number;
  valorPorAcoes: number;
  valorPorFiis: number;
  valorPorRendaFixa: number;
  ganhoAcumulado: number;
}
