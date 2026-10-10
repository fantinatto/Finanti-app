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

export interface MesFinanceiro {
  gastos: GastoMensal[];
  ganhos: GanhoMensal[];
  totalGastos: number;
  totalGanhos: number;
  saldo: number;
  replicadoDe: string | null;
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
