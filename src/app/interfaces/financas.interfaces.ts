export interface GastoMensal {
  id: string;
  anoMes: string;
  nome: string;
  formaPagamento: string | null;
  valor: number;
  pago: boolean;
  dataVencimento: string | null;
  ordem: number;
}

export interface GanhoMensal {
  id: string;
  anoMes: string;
  nome: string;
  valor: number;
  recebido: boolean;
  ordem: number;
}

export interface IndicadoresFinanceiros {
  taxaPoupanca: number | null;
  variacaoGastosMesAnterior: number | null;
  percentualContasPagas: number | null;
  participacaoCartaoNoGasto: number | null;
}

export interface MesFinanceiro {
  gastos: GastoMensal[];
  ganhos: GanhoMensal[];
  totalGastos: number;
  totalGanhos: number;
  saldo: number;
  replicadoDe: string | null;
  fechadoEm: string | null;
  indicadores: IndicadoresFinanceiros;
}

export interface MesHistorico {
  anoMes: string;
  totalGastos: number;
  totalGanhos: number;
  saldo: number;
}

export interface TransacaoCartao {
  id: string;
  anoMes: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string | null;
  naoReconhecida: boolean;
  /** true = parcela futura projetada automaticamente, ainda não confirmada por fatura real. */
  previsto: boolean;
  origemArquivo: string | null;
}

export interface ResumoCategoria {
  categoria: string;
  total: number;
}

export interface ImportarFaturaResultado {
  importadas: number;
  ignoradasDuplicadas: number;
}

export interface UpsertGastoPayload {
  nome: string;
  formaPagamento?: string;
  valor: number;
  pago?: boolean;
  dataVencimento?: string;
}

export interface UpsertGanhoPayload {
  nome: string;
  valor: number;
  recebido?: boolean;
}

/** Catálogo pro <select> — backend aceita qualquer string, isto é só sugestão de UI. */
export const FORMAS_PAGAMENTO = ['Pix', 'Boleto', 'Débito Automático', 'Cartão de Crédito', 'Transferência', 'Dinheiro', 'Outro'] as const;

/** Catálogo de categorias pras transações do cartão — livre (como FORMAS_PAGAMENTO), sugestões
 * baseadas no que já era usado na planilha antiga do usuário. */
export const CATEGORIAS_CARTAO = [
  'Restaurantes', 'Mercado/Emporium', 'Gasolina/Carro', 'Farmácia', 'Uber/Ifood',
  'Compras Online', 'Viagem/Hotel', 'Estética/Bem Estar', 'Roupas', 'Estacionamento',
  'Presente', 'Assinaturas', 'Outros',
] as const;
