export interface RankingItem {
  ticker: string;
  nome: string;
  setor: string | null;
  segmento: string | null;
  scoreQualidade: number | null;
  /** Comparativo diagnóstico a scoreQualidade — Z-score + sigmoide em vez de razão à mediana. */
  qualidadeDelta: number | null;
  scoreRisco: number | null;
  /** Comparativo diagnóstico a scoreRisco — mesmo mês/dado, normalizado por Z-score +
   * sigmoide (curva contínua) em vez de razão com teto/piso. Não é sinal temporal. */
  riscoDelta: number | null;
  /** riscoDelta como principal (fallback pra scoreRisco só quando Δ é null) — é isso que entra
   * no scoreFinal, não scoreRisco puro. Trocado de um blend 60/40 pra isso em 2026-09-23. */
  riscoComposto: number | null;
  scorePreco: number | null;
  /** Comparativo diagnóstico a scorePreco — Z-score + sigmoide em vez de razão à mediana. */
  precoDelta: number | null;
  scoreFinal: number | null;
  /** scoreFinal 100% baseado nos deltas (qualidadeDelta + riscoDelta puro + precoDelta) —
   * pra comparar as duas metodologias de normalização lado a lado. */
  scoreFinalDelta: number | null;
}

export interface IndicadorBruto {
  id: string;
  ticker: string;
  anoMes: string;
  acao: { nome: string; setor: string | null; segmento: string | null };
  pl: number | null;
  pvp: number | null;
  pEbit: number | null;
  roe: number | null;
  roic: number | null;
  roa: number | null;
  margemBruta: number | null;
  margemEbit: number | null;
  margemLiquida: number | null;
  dy: number | null;
  dividaLiquidaPatrimonio: number | null;
  dividaLiquidaEbitda: number | null;
  cagrReceita5a: number | null;
  cagrLucro5a: number | null;
  lpa: number | null;
  vpa: number | null;
}

export interface RangeFiltro {
  min?: number;
  max?: number;
}

export interface IngestionFiltro {
  soAcoes?: boolean;
  excluirFiis?: boolean;
  excluirBdrs?: boolean;
  setor?: string;
  marketCapMin?: number | null;
  filtrosAvancados?: Record<string, RangeFiltro>;
}

export interface FiltroAvancadoMeta {
  campo: string;
  label: string;
  grupo: 'valuation' | 'rentabilidade' | 'endividamento' | 'crescimento' | 'outros';
}

export interface FiltroFixoMeta {
  label: string;
  descricao: string;
}

export interface ResumoColeta {
  total: number;
  comRoe: number;
  comPl: number;
  comDy: number;
}

export interface MedianaGrupo {
  tipoGrupo: string;
  nomeGrupo: string;
  anoMes: string;
  pl: number | null;
  pvp: number | null;
  pEbit: number | null;
  roe: number | null;
  roic: number | null;
  roa: number | null;
  margemBruta: number | null;
  margemEbit: number | null;
  margemLiquida: number | null;
  dy: number | null;
  dividaLiquidaPatrimonio: number | null;
  dividaLiquidaEbitda: number | null;
  cagrReceita5a: number | null;
  cagrLucro5a: number | null;
}

export interface Top3Item {
  ticker: string;
  nome: string;
  scoreFinal: number | null;
  scoreQualidade: number | null;
  scoreRisco: number | null;
  scorePreco: number | null;
}

export type Top3PorGrupo = Record<string, Top3Item[]>;

export interface HistoricoRankingItem {
  anoMes: string;
  nomeGrupo: string;
  mediaTop3: number;
}
