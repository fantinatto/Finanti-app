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
  origem: 'recomendacao' | 'aporte_semanal' | 'reinicio' | 'caixa' | 'manual';
  motivo: string | null;
  /** Só em vendas — lucro/prejuízo já apurado (valor da venda − custo ao precoMedio da época). Null em compras. */
  ganhoRealizado: number | null;
  createdAt: string;
}

/** Aporte semanal agora só credita caixaDisponivel — não compra nada sozinho (correção
 * 2026-09-30: antes diluía automaticamente entre setores subalocados). */
export interface AplicarAporteResultado {
  semanasAplicadas: number;
  valorAportado: number;
  caixaDisponivel?: number;
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
