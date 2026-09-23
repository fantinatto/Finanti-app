export type RegraSelecionada = 'base80' | 'base100' | 'base110' | 'base120' | 'base_di' | 'base_custom';

/** Qual ranking as recomendações de troca/aporte em Investimentos usam pra comparar ações.
 * Não afeta o rebalanceamento por valor (sempre por setor, via alocacoesSetor). */
export type TipoRankingRecomendacao = 'setor' | 'segmento' | 'geral' | 'hibrido';

export interface AlocacaoItem {
  id?: string;
  nome: string;
  percentual: number;
}

export interface PortfolioConfig {
  id: string;
  userId: string;
  percentualRendaFixa: number;
  percentualFiis: number;
  percentualAcoes: number;
  percentualEstouro: number;
  regraSelecionada: RegraSelecionada | null;
  baseRegraCustom: number | null;
  tipoRankingRecomendacao: TipoRankingRecomendacao;
  alocacoesSetor: { id: string; setor: string; percentual: number }[];
  alocacoesSegmentoFii: { id: string; segmento: string; percentual: number }[];
}

export interface UpsertPortfolioConfigPayload {
  percentualRendaFixa: number;
  percentualFiis: number;
  percentualAcoes: number;
  percentualEstouro: number;
  regraSelecionada?: RegraSelecionada;
  baseRegraCustom?: number;
  tipoRankingRecomendacao?: TipoRankingRecomendacao;
  alocacoesSetor: AlocacaoItem[];
  alocacoesSegmentoFii: AlocacaoItem[];
}

export interface SugestaoRegra {
  idade: number;
  base: number;
  percentualSugerido: number;
  contratoDi?: string;
  taxaDi?: number;
}

export type TipoInvestimento = 'acao' | 'fii' | 'renda_fixa';

export interface Investimento {
  id: string;
  tipo: TipoInvestimento;
  ticker: string | null;
  nome: string;
  precoMedio: number;
  quantidade: number;
}

export interface UpsertInvestimentoPayload {
  tipo: TipoInvestimento;
  ticker?: string;
  nome: string;
  precoMedio: number;
  quantidade: number;
}

export interface GanhoInvestimento {
  id: string;
  tipo: TipoInvestimento;
  ticker: string | null;
  nome: string;
  precoMedio: number;
  quantidade: number;
  cotacaoAtual: number | null;
  valorInvestido: number;
  valorAtual: number | null;
  ganho: number | null;
  ganhoPercentual: number | null;
}

export type CategoriaAcao =
  | 'aporte_direcionado'
  | 'aportar'
  | 'troca_sugerida'
  | 'venda_prioritaria'
  | 'reducao_risco'
  | 'manter';

export interface RecomendacaoHolding {
  id: string;
  ticker: string;
  nome: string;
  setor: string | null;
  scoreFinal: number | null;
  scoreQualidade: number | null;
  scoreRisco: number | null;
  scorePreco: number | null;
  /** % que o setor dessa ação representa hoje dentro da fatia de ações da carteira. */
  percentualReal: number | null;
  /** % alvo configurada pra esse setor em Carteira. Null se não configurado. */
  percentualAlvo: number | null;
  categoriaAcao: CategoriaAcao;
  sugestaoTroca: { ticker: string; nome: string; scoreFinal: number | null } | null;
  /** Por que sugestaoTroca foi acionada — null quando sugestaoTroca também é null. */
  motivoTroca: string | null;
  /** scoreFinal do sugerido − scoreFinal atual — null quando sugestaoTroca também é null. */
  deltaScoreTroca: number | null;
  sugestaoRebalanceamento: 'comprar' | 'vender' | null;
  /** Valor em R$ pra aproximar o setor do alvo — quanto vender ou comprar. Null sem sugestão. */
  valorSugerido: number | null;
}
