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
  /** "Setor" de FII = tipo de fundo (Fundo de Tijolo/Papel/Misto) — dimensão independente do
   * segmento de atuação (ver AlocacaoSetorFii no backend). */
  alocacoesSetorFii: { id: string; setor: string; percentual: number }[];
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
  alocacoesSetorFii: AlocacaoItem[];
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

export type TipoRentabilidadeRendaFixa = 'cdi' | 'prefixado';

export interface RendaFixaDetalhe {
  id: string;
  tipoRentabilidade: TipoRentabilidadeRendaFixa;
  percentualOuTaxa: number;
  dataAplicacao: string;
  dataVencimento: string;
  isentoIr: boolean;
}

export interface Investimento {
  id: string;
  tipo: TipoInvestimento;
  ticker: string | null;
  nome: string;
  precoMedio: number;
  quantidade: number;
  carteira: TipoCarteira;
  /** Só pra tipo='renda_fixa' — null em posições sem % CDI/prefixado cadastrado ainda. */
  rendaFixaDetalhe?: RendaFixaDetalhe | null;
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
  /** Só pra tipo='renda_fixa' — ausente preserva o comportamento antigo (valorAtual estático). */
  rendaFixa?: {
    tipoRentabilidade: TipoRentabilidadeRendaFixa;
    percentualOuTaxa: number;
    dataAplicacao: string;
    dataVencimento: string;
    isentoIr?: boolean;
  };
}

export interface CenarioSimulacaoRendaFixa {
  nome: string;
  valorInvestido: number;
  tipoRentabilidade: TipoRentabilidadeRendaFixa;
  percentualOuTaxa: number;
  dataAplicacao: string;
  dataVencimento: string;
  isentoIr?: boolean;
}

export interface ResultadoSimulacaoRendaFixa {
  nome: string;
  valorInvestido: number;
  dias: number;
  taxaAnualEquivalente: number;
  valorBruto: number;
  rendimentoBruto: number;
  aliquotaIr: number;
  ir: number;
  valorLiquido: number;
  rendimentoLiquido: number;
  rentabilidadeLiquidaPercentual: number;
  melhor: boolean;
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
  /** Setor pra tipo='acao', segmento pra tipo='fii' — null pra renda_fixa ou sem dado. */
  classificacao: string | null;
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

/** Espelha RecomendacaoHolding, mas pra FII — troca setor/scoreQualidade/scoreRisco/scorePreco
 * pelos 4 pilares do ranking de FII. Reusa CategoriaAcao como está (mesma matriz de decisão). */
export interface RecomendacaoHoldingFii {
  id: string;
  ticker: string;
  nome: string;
  segmento: string | null;
  scoreFinal: number | null;
  scoreValuation: number | null;
  scoreRenda: number | null;
  scoreLiquidezPorte: number | null;
  scorePreservacao: number | null;
  percentualReal: number | null;
  percentualAlvo: number | null;
  categoriaAcao: CategoriaAcao;
  sugestaoTroca: { ticker: string; nome: string; scoreFinal: number | null } | null;
  motivoTroca: string | null;
  deltaScoreTroca: number | null;
  sugestaoRebalanceamento: 'comprar' | 'vender' | null;
  valorSugerido: number | null;
  quantidadeSugerida: number | null;
  prioridade: 'alta' | 'media' | 'baixa' | null;
  /** 'desenvolvimento' | 'dividend_trap' | 'desenvolvimento+dividend_trap' | null. */
  alertaRisco: string | null;
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

/** Espelha BalanceamentoSetor, mas pro segmento de atuação do FII (Shoppings, Lajes
 * Corporativas, Logística, etc — ver Fii.segmento/getBalanceamentoPorSegmentoFii). */
export interface BalanceamentoSegmentoFii {
  segmento: string;
  valorAtual: number;
  percentualAtual: number;
  percentualAlvo: number;
  diferenca: number;
  status: 'sobrealocado' | 'subalocado' | 'equilibrado';
  semNenhumFii: boolean;
}

/** Espelha BalanceamentoSegmentoFii, mas pro "setor" de FII (tipo de fundo: Fundo de
 * Tijolo/Papel/Misto — ver Fii.tipoFundo/getBalanceamentoPorSetorFii). */
export interface BalanceamentoSetorFii {
  setor: string;
  valorAtual: number;
  percentualAtual: number;
  percentualAlvo: number;
  diferenca: number;
  status: 'sobrealocado' | 'subalocado' | 'equilibrado';
  semNenhumFii: boolean;
}

/** Fatia de composição pra gráfico de diversificação (getDiversificacao) — percentual sempre
 * relativo ao total DESSA fatia específica (macro = % da carteira, drill-down = % da categoria). */
export interface FatiaDiversificacao {
  chave: string;
  valor: number;
  percentual: number;
}

export interface DiversificacaoCarteira {
  macro: FatiaDiversificacao[];
  porSetorAcao: FatiaDiversificacao[];
  porTipoFundoFii: FatiaDiversificacao[];
}

/** Espelha BalanceamentoSetor, mas pro macro (Ações/FIIs/Renda Fixa) contra o alvo configurado
 * em Carteira — ver getResumoDiversificacao. Sempre as 3 chaves, mesmo com valor/alvo zero. */
export interface BalanceamentoMacro {
  chave: string;
  valorAtual: number;
  percentualAtual: number;
  percentualAlvo: number;
  diferenca: number;
  status: 'sobrealocado' | 'subalocado' | 'equilibrado';
}

export interface ResumoDiversificacao {
  macro: BalanceamentoMacro[];
  /** 100 = carteira perfeitamente alinhada ao alvo macro configurado. */
  percentualDiversificado: number;
  /** Complemento de percentualDiversificado — % do valor que precisaria migrar entre
   * Ações/FIIs/Renda Fixa pra bater o alvo. */
  percentualFaltante: number;
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

/** Espelha SaudeCarteira, mas pros 4 pilares do ranking de FII (ver FiiRankingItem/
 * getSaudeCarteiraFii) em vez de Qualidade/Risco/Preço de ação. */
export interface SaudeCarteiraFii {
  scoreValuationMedio: number | null;
  scoreRendaMedio: number | null;
  scoreLiquidezPorteMedio: number | null;
  scorePreservacaoMedio: number | null;
  scoreFinalMedio: number | null;
  pesoValuation: number;
  pesoRenda: number;
  pesoLiquidezPorte: number;
  pesoPreservacao: number;
  pesoFinal: number;
  valorTotalFiis: number;
}

// ── Preview do motor novo (Search Engine) — GET /portfolio/recommendation-engine/preview ──────
// Espelha (parcialmente — só os campos que a tela de Preview usa) os tipos reais do backend em
// recommendation-engine/domain/*.ts. Não é o motor legado (RecomendacaoHolding acima) — deliberadamente
// paralelo, ver plano "Preview do Search Engine".

export type PortfolioMoveTypePreview = 'BUY' | 'ADD_NEW_POSITION' | 'REDUCE' | 'SELL' | 'ROTATE_WITHIN_SECTOR';
export type ReduceSizingStrategyPreview = 'REDUCE_TO_UPPER_BAND' | 'REDUCE_PARTIAL' | 'REDUCE_TO_TARGET' | 'FULL_EXIT';

export interface PortfolioMovePreview {
  id: string;
  type: PortfolioMoveTypePreview;
  sourceTicker?: string;
  targetTicker?: string;
  setor: string | null;
  amount: number;
  quantity?: number;
  primaryReason: string;
  secondaryReasons: string[];
  confidence: 'HIGH' | 'MEDIUM';
  sizingStrategy?: ReduceSizingStrategyPreview;
}

export interface SearchHealthAxisPreview {
  value: number | null;
  coverage: number;
}

export interface PortfolioEvaluationPreview {
  health: {
    search: { quality: SearchHealthAxisPreview; risk: SearchHealthAxisPreview; price: SearchHealthAxisPreview };
    lowCoverageWarnings: string[];
  };
  balance: {
    totalSectorDeviation: number;
    sectorsOutsideBand: number;
    worstSegmentConcentration: number;
    unallocatedCapital: number;
  };
}

export interface PortfolioCapitalStatePreview {
  existingCash: number;
  externalContributionBudget: number;
  proceedsGeneratedByPlan: number;
}

export type CandidateLifecyclePreview =
  | 'INVALID'
  | 'MOVE_ORDERING_CUT'
  | 'EVALUATED'
  | 'DOMINATED'
  | 'SELECTED'
  | 'TRANSPOSITION_REJECTED'
  | 'BEAM_PRUNED';

export interface CandidateOutcomePreview {
  move: PortfolioMovePreview;
  lifecycle: CandidateLifecyclePreview;
  /** Só presente quando lifecycle é EVALUATED/SELECTED — nos outros casos o Comparator nunca
   * rodou entre este candidato e o vencedor (ver plano "Decision Trace: lifecycle real"). */
  decidedBy: string | null;
  orderingRank?: number;
  evaluation?: PortfolioEvaluationPreview;
  invalidReason?: 'VALIDATOR' | 'INSUFFICIENT_FUNDING' | 'CYCLE_REVERSAL';
}

export interface DynamicAllocationBandResultPreview {
  setor: string;
  target: number;
  baseTolerance: number;
  priceAttractiveness: number | null;
  dynamicAdjustment: number;
  min: number;
  max: number;
  status: 'sobrealocado' | 'subalocado' | 'equilibrado';
  guardrailApplied: boolean;
  fallbackReason: 'INSUFFICIENT_PRICE_DATA' | null;
}

export interface RecommendationPreviewStep {
  sequence: number;
  move: PortfolioMovePreview;
  saleNotional: number;
  purchaseNotional: number;
  capitalBefore: PortfolioCapitalStatePreview;
  capitalAfter: PortfolioCapitalStatePreview;
  evaluationBefore: PortfolioEvaluationPreview;
  evaluationAfter: PortfolioEvaluationPreview;
  decidedBy: string;
  candidateOutcomes: CandidateOutcomePreview[];
  bandaSetor?: DynamicAllocationBandResultPreview;
}

export interface RecommendationPreviewAlternative {
  moves: PortfolioMovePreview[];
  finalEvaluation: PortfolioEvaluationPreview;
  turnover: number;
}

export type OwnershipStatusPreview = 'STRONG' | 'ACCEPTABLE' | 'WEAK';
export type EntryStatusPreview = 'ATTRACTIVE' | 'NEUTRAL' | 'EXPENSIVE';
export type PolicyEligibilityPreview = 'INELIGIBLE' | 'ELIGIBLE' | 'PREFERRED';

export interface ExecutarNextBestActionResultPreview {
  status: 'EXECUTED' | 'ALREADY_EXECUTED';
  projectedMove?: PortfolioMovePreview;
  executedTransaction: unknown;
  executionDifference?: { quantityDiff: number; amountDiff: number };
}

/** Corpo do 409 quando a carteira mudou desde o Preview confirmado (ver anti-stale, plano
 * "Next Best Action"). */
export interface NextBestActionChangedErrorPreview {
  code: 'NEXT_BEST_ACTION_CHANGED';
  currentNextBestAction: PortfolioMovePreview | null;
  currentSnapshotHash?: string;
}

export interface PolicyDiagnosticsPreview {
  totalExcluded: number;
  byReason: Record<'OWNERSHIP_WEAK' | 'ENTRY_EXPENSIVE' | 'FALLBACK_TO_ELIGIBLE', number>;
  perStep: {
    sequence: number;
    setor: string | null;
    excluded: { ticker: string; ownership: OwnershipStatusPreview; entry: EntryStatusPreview; eligibility: PolicyEligibilityPreview }[];
  }[];
}

export interface RecommendationPreviewResult {
  engineVersion: string;
  generatedAt: string;
  carteira: TipoCarteira;
  anoMes: string;
  snapshot: { portfolioValue: number; investedValue: number; availableCapital: number; rankingVersion: string; snapshotHash: string };
  initialEvaluation: PortfolioEvaluationPreview;
  bestPlan: {
    steps: RecommendationPreviewStep[];
    /** Ver plano "Next Best Action" — só ESTA é uma recomendação real; `null` quando o motor não
     * tem nenhuma ação admissível pra propor agora (ver `terminalReason`). */
    nextBestAction: RecommendationPreviewStep | null;
    /** Devolver tal qual em `expectedActionFingerprint` na hora de executar. */
    nextBestActionFingerprint?: string;
    /** Nunca apresentar como plano já aprovado — é só a projeção da busca. */
    projectedPath: RecommendationPreviewStep[];
    terminalReason?: 'NO_ADMISSIBLE_MOVE' | 'STOP_SELECTED';
    finalEvaluation: PortfolioEvaluationPreview;
    turnover: number;
    capitalResidual: PortfolioCapitalStatePreview;
  };
  policyDiagnostics: PolicyDiagnosticsPreview;
  alternatives: RecommendationPreviewAlternative[];
  searchMetadata: {
    depthReached: number;
    statesGenerated: number;
    statesEvaluated: number;
    statesPruned: number;
    transpositionHits: number;
    durationMs: number;
  };
  config: {
    maxDepth: number;
    beamWidth: number;
    maxMovesPerNode: number;
    rebalanceToleranceMode: 'FIXED' | 'DYNAMIC_PRICE';
    balanceMaterialityThresholdPp: number;
    engineVersion: string;
    rankingVersion: string;
  };
}
