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
}

export interface ApuracaoAnual {
  ano: number;
  meses: ApuracaoMensalBucket[];
  avisos: string[];
}
