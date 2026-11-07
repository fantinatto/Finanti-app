export type AssetTypeFiscal = 'acao' | 'fii';
export type TipoOperacaoFiscal = 'compra' | 'venda';
export type TradeTypeFiscal = 'swing' | 'day_trade';
export type BucketFiscal = 'comum' | 'day_trade' | 'fii_fiagro';

export interface OperacaoFiscal {
  id: string;
  data: string;
  ticker: string;
  assetType: AssetTypeFiscal;
  tipo: TipoOperacaoFiscal;
  tradeType: TradeTypeFiscal;
  quantidade: number;
  precoUnitario: number;
  custos: number;
  irrfRetido: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertOperacaoFiscalPayload {
  data: string;
  ticker: string;
  assetType: AssetTypeFiscal;
  tipo: TipoOperacaoFiscal;
  tradeType?: TradeTypeFiscal;
  quantidade: number;
  precoUnitario: number;
  custos?: number;
  irrfRetido?: number;
}

export interface ApuracaoMensalBucket {
  anoMes: string;
  bucket: BucketFiscal;
  totalVendas: number;
  resultadoBruto: number;
  prejuizoCompensado: number;
  resultadoAposCompensacao: number;
  prejuizoAcumuladoFinal: number;
  isento: boolean;
  baseTributavel: number;
  aliquota: number;
  impostoDevido: number;
}

export interface DarfMensal {
  anoMes: string;
  codigoReceita: string;
  impostoDevido: number;
  irrfDoMes: number;
  irrfEstimado: boolean;
  irrfDisponivel: number;
  irrfCompensado: number;
  irrfSaldoFinal: number;
  valorAcumuladoAnterior: number;
  valorDarf: number;
  pagar: boolean;
  vencimento: string;
}

export interface ApuracaoAnual {
  ano: number;
  meses: ApuracaoMensalBucket[];
  darfs: DarfMensal[];
  totalDarfAno: number;
  irrfSaldoNaoCompensadoAno: number;
  darfAcumuladoFimAno: number;
  avisos: string[];
}

export type ClasseAtivo = 'ON' | 'PN' | 'PNA' | 'PNB' | 'UNIT' | 'FII' | 'OUTRO';

export interface PosicaoAno {
  quantidade: number;
  custoMedio: number;
  custoTotal: number;
}

export interface BemDireito {
  ticker: string;
  assetType: AssetTypeFiscal;
  classe: ClasseAtivo;
  grupo: string;
  codigo: string;
  descricaoCodigo: string;
  anterior: PosicaoAno;
  atual: PosicaoAno;
  valorMercado: number | null;
  cotacaoReferencia: { anoMes: string; preco: number } | null;
  cnpj: string | null;
  razaoSocial: string | null;
  razaoSocialSugerida: boolean;
  administrador: string | null;
  cnpjAdministrador: string | null;
  discriminacao: string;
  pendencias: string[];
}

export interface DivergenciaCarteira {
  ticker: string;
  quantidadeLivro: number;
  quantidadeCarteira: number;
}

export interface BensDireitosAnual {
  ano: number;
  corretoraNome: string | null;
  corretoraCnpj: string | null;
  itens: BemDireito[];
  totais: { anterior: number; atual: number; valorMercado: number };
  divergencias: DivergenciaCarteira[];
}

export interface UpsertAtivoFiscalPayload {
  cnpj?: string;
  razaoSocial?: string;
  administrador?: string;
  cnpjAdministrador?: string;
}

export interface ConfigFiscal {
  corretoraNome: string | null;
  corretoraCnpj: string | null;
}
