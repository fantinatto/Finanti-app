import { Component, OnInit } from '@angular/core';
import { FiscalService } from '../../../services/fiscal.service';
import {
  ApuracaoAnual,
  ApuracaoMensalBucket,
  DarfMensal,
  AssetTypeFiscal,
  BucketFiscal,
  OperacaoFiscal,
  TipoOperacaoFiscal,
  TradeTypeFiscal,
  UpsertOperacaoFiscalPayload,
} from '../../../interfaces/fiscal.interfaces';

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const BUCKET_LABELS: Record<BucketFiscal, string> = {
  comum: 'Ações — operações comuns (swing)',
  day_trade: 'Day trade',
  fii_fiagro: 'FII / Fiagro',
};

type AbaFiscal = 'operacoes' | 'darf' | 'apuracao' | 'bens';

const ABAS: { id: AbaFiscal; label: string }[] = [
  { id: 'operacoes', label: 'Operações' },
  { id: 'darf', label: 'DARF' },
  { id: 'apuracao', label: 'Apuração por tipo' },
  { id: 'bens', label: 'Bens e Direitos' },
];

const CHAVE_ABA = 'fiscal.abaAtiva';

interface FormOperacao {
  data: string;
  ticker: string;
  assetType: AssetTypeFiscal;
  tipo: TipoOperacaoFiscal;
  tradeType: TradeTypeFiscal;
  quantidade: number | null;
  precoUnitario: number | null;
  custos: number | null;
  irrfRetido: number | null;
}

function formVazio(): FormOperacao {
  return {
    data: new Date().toISOString().slice(0, 10),
    ticker: '',
    assetType: 'acao',
    tipo: 'compra',
    tradeType: 'swing',
    quantidade: null,
    precoUnitario: null,
    custos: null,
    irrfRetido: null,
  };
}

@Component({
  selector: 'app-fiscal',
  templateUrl: './fiscal.component.html',
  styleUrls: ['./fiscal.component.scss'],
})
export class FiscalComponent implements OnInit {
  readonly buckets: BucketFiscal[] = ['comum', 'day_trade', 'fii_fiagro'];
  readonly abas = ABAS;
  abaAtiva: AbaFiscal = lerAbaSalva();

  anoSelecionado = new Date().getFullYear();
  anosDisponiveis: number[] = [];

  operacoes: OperacaoFiscal[] = [];
  apuracao: ApuracaoAnual | null = null;

  form: FormOperacao = formVazio();
  editandoId: string | null = null;
  salvando = false;
  erro: string | null = null;

  carregandoOperacoes = false;
  carregandoApuracao = false;

  constructor(private fiscal: FiscalService) {}

  ngOnInit(): void {
    const anoAtual = new Date().getFullYear();
    this.anosDisponiveis = [anoAtual + 1, anoAtual, anoAtual - 1, anoAtual - 2, anoAtual - 3];
    this.carregarTudo();
  }

  setAba(aba: AbaFiscal): void {
    this.abaAtiva = aba;
    try {
      localStorage.setItem(CHAVE_ABA, aba);
    } catch {
      /* storage indisponível: só não lembra a aba */
    }
  }

  onAnoChange(): void {
    this.carregarTudo();
  }

  private carregarTudo(): void {
    this.carregarOperacoes();
    this.carregarApuracao();
  }

  private carregarOperacoes(): void {
    this.carregandoOperacoes = true;
    this.fiscal.listarOperacoes(this.anoSelecionado).subscribe({
      next: (dados) => {
        this.operacoes = dados;
        this.carregandoOperacoes = false;
      },
      error: () => {
        this.carregandoOperacoes = false;
      },
    });
  }

  private carregarApuracao(): void {
    this.carregandoApuracao = true;
    this.fiscal.getApuracaoAnual(this.anoSelecionado).subscribe({
      next: (dados) => {
        this.apuracao = dados;
        this.carregandoApuracao = false;
      },
      error: () => {
        this.carregandoApuracao = false;
      },
    });
  }

  salvar(): void {
    if (!this.form.ticker || this.form.quantidade == null || this.form.precoUnitario == null) return;

    const payload: UpsertOperacaoFiscalPayload = {
      data: this.form.data,
      ticker: this.form.ticker.toUpperCase(),
      assetType: this.form.assetType,
      tipo: this.form.tipo,
      tradeType: this.form.tradeType,
      quantidade: this.form.quantidade,
      precoUnitario: this.form.precoUnitario,
      custos: this.form.custos ?? 0,
      ...(this.form.tipo === 'venda' && this.form.irrfRetido != null ? { irrfRetido: this.form.irrfRetido } : {}),
    };

    this.salvando = true;
    this.erro = null;
    const obs = this.editandoId
      ? this.fiscal.atualizarOperacao(this.editandoId, payload)
      : this.fiscal.criarOperacao(payload);

    obs.subscribe({
      next: () => {
        this.salvando = false;
        this.cancelarEdicao();
        this.carregarTudo();
      },
      error: (err) => {
        this.salvando = false;
        this.erro = err?.error?.message ?? 'Erro ao salvar operação.';
      },
    });
  }

  editar(op: OperacaoFiscal): void {
    this.editandoId = op.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.form = {
      data: op.data.slice(0, 10),
      ticker: op.ticker,
      assetType: op.assetType,
      tipo: op.tipo,
      tradeType: op.tradeType,
      quantidade: op.quantidade,
      precoUnitario: op.precoUnitario,
      custos: op.custos,
      irrfRetido: op.irrfRetido,
    };
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.erro = null;
    this.form = formVazio();
  }

  remover(op: OperacaoFiscal): void {
    if (!window.confirm(`Remover a operação de ${op.tipo} de ${op.ticker} em ${op.data.slice(0, 10)}?`)) return;
    this.fiscal.removerOperacao(op.id).subscribe(() => this.carregarTudo());
  }

  mesesDoBucket(bucket: BucketFiscal): ApuracaoMensalBucket[] {
    return this.apuracao?.meses.filter((m) => m.bucket === bucket) ?? [];
  }

  /** Só meses com algo a mostrar (imposto, IRRF, saldo ou acumulado). */
  get darfsRelevantes(): DarfMensal[] {
    return (this.apuracao?.darfs ?? []).filter(
      (d) => d.impostoDevido > 0 || d.irrfDoMes > 0 || d.valorAcumuladoAnterior > 0 || d.irrfSaldoFinal > 0,
    );
  }

  aliquotaPct(bucket: BucketFiscal): number {
    const primeiro = this.mesesDoBucket(bucket)[0];
    return primeiro ? Math.round(primeiro.aliquota * 100) : 0;
  }

  formatarData(iso: string): string {
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  bucketLabel(bucket: BucketFiscal): string {
    return BUCKET_LABELS[bucket];
  }

  nomeMes(anoMes: string): string {
    const mes = Number(anoMes.split('-')[1]) - 1;
    return NOMES_MES[mes] ?? anoMes;
  }

  resultadoClass(valor: number): string {
    if (valor > 0) return 'valor--positivo';
    if (valor < 0) return 'valor--negativo';
    return '';
  }
}

function lerAbaSalva(): AbaFiscal {
  try {
    const salva = localStorage.getItem(CHAVE_ABA);
    return ABAS.some((a) => a.id === salva) ? (salva as AbaFiscal) : 'operacoes';
  } catch {
    return 'operacoes';
  }
}
