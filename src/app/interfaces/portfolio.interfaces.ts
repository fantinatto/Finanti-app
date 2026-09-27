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
  /** false = recomendações e execuções na Simulação só operam em múltiplos de 100 ações (lote-padrão B3). */
  permiteFracionario: boolean;
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
  permiteFracionario?: boolean;
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

export type TipoCarteira = 'real' | 'simulacao';

export interface Investimento {
  id: string;
  tipo: TipoInvestimento;
  ticker: string | null;
  nome: string;
  precoMedio: number;
  quantidade: number;
  carteira: TipoCarteira;
}

export interface UpsertInvestimentoPayload {
  tipo: TipoInvestimento;
  ticker?: string;
  nome: string;
  precoMedio: number;
  quantidade: number;
  /** Só tem efeito na criação da carteira REAL — espelha a compra como uma OperacaoFiscal.
   * Ignorado em edição e na Simulação (sem implicação fiscal). */
  registrarFiscal?: boolean;
  dataOperacao?: string;
  custosFiscais?: number;
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
  | 'aportar'
  | 'troca_sugerida'
  | 'venda_prioritaria'
  | 'reducao_risco'
  | 'aguardar_caixa'
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
  /** Quantidade de ações equivalente a valorSugerido, já arredondada pro lote/fracionário. Null sem sugestão. */
  quantidadeSugerida: number | null;
  /** Prioridade de execução (backend já ordena a lista por isso) — null só em categoriaAcao='manter'. */
  prioridade: 'alta' | 'media' | 'baixa' | null;
}

export interface BalanceamentoSetor {
  setor: string;
  valorAtual: number;
  percentualAtual: number;
  percentualAlvo: number;
  /** percentualAtual − percentualAlvo. Positivo = sobrealocado, negativo = subalocado. */
  diferenca: number;
  status: 'sobrealocado' | 'subalocado' | 'equilibrado';
  /** true quando o setor tem alvo configurado mas ZERO ações hoje — "setor descoberto". */
  semNenhumaAcao: boolean;
}

/** Qualidade/Risco/Preço/Final médios da carteira, ponderados pelo valor atual de cada posição. */
export interface SaudeCarteira {
  scoreQualidadeMedio: number | null;
  riscoCompostoMedio: number | null;
  scorePrecoMedio: number | null;
  scoreFinalMedio: number | null;
  pesoQualidade: number;
  pesoRisco: number;
  pesoPreco: number;
  pesoFinal: number;
  valorTotalCarteira: number;
}
