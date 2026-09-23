import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PortfolioService } from '../../../services/portfolio.service';
import { MarketDataService } from '../../../services/market-data.service';
import {
  CategoriaAcao,
  GanhoInvestimento,
  Investimento,
  RecomendacaoHolding,
  TipoInvestimento,
  UpsertInvestimentoPayload,
} from '../../../interfaces/portfolio.interfaces';

const LABEL_TIPO: Record<TipoInvestimento, string> = {
  acao: 'Ação',
  fii: 'FII',
  renda_fixa: 'Renda Fixa',
};

/** Rótulo + classe de cor do badge — 1:1 com a categoria que o backend já decidiu (matriz de decisão em investimento.service.ts). */
const CATEGORIA_META: Record<CategoriaAcao, { label: string; classe: string }> = {
  aporte_direcionado: { label: 'Aporte direcionado', classe: 'cat--aporte' },
  aportar: { label: 'Aportar', classe: 'cat--aporte' },
  troca_sugerida: { label: 'Troca sugerida', classe: 'cat--troca' },
  venda_prioritaria: { label: 'Venda prioritária', classe: 'cat--venda' },
  reducao_risco: { label: 'Redução de risco', classe: 'cat--venda' },
  manter: { label: 'Manter', classe: 'cat--manter' },
};

interface FormInvestimento {
  tipo: TipoInvestimento;
  ticker: string;
  nome: string;
  precoMedio: number | null;
  quantidade: number | null;
}

const FORM_VAZIO: FormInvestimento = { tipo: 'acao', ticker: '', nome: '', precoMedio: null, quantidade: null };

@Component({
  selector: 'app-investimentos',
  templateUrl: './investimentos.component.html',
  styleUrls: ['./investimentos.component.scss'],
})
export class InvestimentosComponent implements OnInit {
  readonly labelTipo = LABEL_TIPO;

  investimentos: Investimento[] = [];
  /** Só tipo 'acao' — os únicos com score/ranking. Guardado à parte (não getter) pra não
   * recriar o array a cada change detection (mesma lição do travamento em Coleta). */
  acoesInvestidas: Investimento[] = [];
  ganhos: GanhoInvestimento[] = [];
  recomendacoes: RecomendacaoHolding[] = [];

  meses: string[] = [];
  anoMesSelecionado = '';

  form: FormInvestimento = { ...FORM_VAZIO };
  editandoId: string | null = null;

  carregando = false;
  carregandoGanhos = false;
  carregandoRecomendacoes = false;
  salvando = false;
  removendoId: string | null = null;

  constructor(
    private portfolioService: PortfolioService,
    private marketData: MarketDataService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.carregarInvestimentos();
    this.marketData.getMeses().subscribe({
      next: (meses) => {
        this.meses = meses;
        if (meses.length) {
          this.anoMesSelecionado = meses[0];
          this.carregarGanhos();
        }
      },
    });
  }

  carregarInvestimentos(): void {
    this.carregando = true;
    this.portfolioService.listarInvestimentos().subscribe({
      next: (dados) => {
        this.investimentos = dados;
        this.acoesInvestidas = dados.filter((i) => i.tipo === 'acao' && i.ticker);
        this.carregando = false;
        if (this.anoMesSelecionado) this.carregarGanhos();
      },
      error: () => { this.carregando = false; },
    });
  }

  carregarGanhos(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoGanhos = true;
    this.portfolioService.getGanhosInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.ganhos = dados;
        this.carregandoGanhos = false;
      },
      error: () => { this.carregandoGanhos = false; },
    });

    this.carregandoRecomendacoes = true;
    this.portfolioService.getRecomendacoesInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.recomendacoes = dados;
        this.carregandoRecomendacoes = false;
      },
      error: () => { this.carregandoRecomendacoes = false; },
    });
  }

  onMesChange(): void {
    this.carregarGanhos();
  }

  recomendacaoDe(id: string): RecomendacaoHolding | null {
    return this.recomendacoes.find((r) => r.id === id) ?? null;
  }

  formatScore(score: number | null): string {
    return score !== null ? score.toFixed(2) : '—';
  }

  scoreClass(score: number | null): string {
    if (score === null) return 'score--vazio';
    if (score >= 1.3) return 'score--alto';
    if (score >= 0.8) return 'score--medio';
    return 'score--baixo';
  }

  categoriaLabel(categoria: CategoriaAcao): string {
    return CATEGORIA_META[categoria].label;
  }

  categoriaClasse(categoria: CategoriaAcao): string {
    return CATEGORIA_META[categoria].classe;
  }

  /** Texto da recomendação — junta troca (se houver) e valor de rebalanceamento (se houver) numa frase só. */
  textoRecomendacao(r: RecomendacaoHolding): string {
    const valor = r.valorSugerido != null ? this.formatMoeda(Math.abs(r.valorSugerido)) : null;

    if (r.sugestaoTroca) {
      const alvo = `${r.sugestaoTroca.ticker} (${this.formatScore(r.sugestaoTroca.scoreFinal)})`;
      if (r.categoriaAcao === 'aporte_direcionado') return `Comprar ${alvo} · ${valor}`;
      if (r.categoriaAcao === 'venda_prioritaria') return `Vender ${valor} — migrar para ${alvo}`;
      return `Migrar para ${alvo}`; // troca_sugerida — sem valor de rebalanceamento associado
    }

    if (r.sugestaoRebalanceamento === 'comprar') return `Comprar ${valor}`;
    if (r.sugestaoRebalanceamento === 'vender') return `Vender ${valor}`;
    return '—';
  }

  deltaScoreLabel(delta: number | null): string {
    if (delta === null) return '';
    return `+${delta.toFixed(2)} score`;
  }

  get precisaTicker(): boolean {
    return this.form.tipo !== 'renda_fixa';
  }

  get formValido(): boolean {
    return (
      this.form.nome.trim().length > 0 &&
      this.form.precoMedio != null && this.form.precoMedio >= 0 &&
      this.form.quantidade != null && this.form.quantidade >= 0 &&
      (!this.precisaTicker || this.form.ticker.trim().length > 0)
    );
  }

  editar(inv: Investimento): void {
    this.editandoId = inv.id;
    this.form = {
      tipo: inv.tipo,
      ticker: inv.ticker ?? '',
      nome: inv.nome,
      precoMedio: inv.precoMedio,
      quantidade: inv.quantidade,
    };
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.form = { ...FORM_VAZIO };
  }

  salvar(): void {
    if (!this.formValido || this.salvando) return;
    this.salvando = true;

    const payload: UpsertInvestimentoPayload = {
      tipo: this.form.tipo,
      ticker: this.precisaTicker ? this.form.ticker.trim().toUpperCase() : undefined,
      nome: this.form.nome.trim(),
      precoMedio: this.form.precoMedio as number,
      quantidade: this.form.quantidade as number,
    };

    const request = this.editandoId
      ? this.portfolioService.atualizarInvestimento(this.editandoId, payload)
      : this.portfolioService.criarInvestimento(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(this.editandoId ? 'Investimento atualizado' : 'Investimento cadastrado', 'Carteira');
        this.salvando = false;
        this.cancelarEdicao();
        this.carregarInvestimentos();
      },
      error: () => {
        this.toastr.error('Não foi possível salvar o investimento', 'Erro');
        this.salvando = false;
      },
    });
  }

  remover(inv: Investimento): void {
    if (this.removendoId) return;
    this.removendoId = inv.id;
    this.portfolioService.removerInvestimento(inv.id).subscribe({
      next: () => {
        this.toastr.success('Investimento removido', 'Carteira');
        this.removendoId = null;
        if (this.editandoId === inv.id) this.cancelarEdicao();
        this.carregarInvestimentos();
      },
      error: () => {
        this.toastr.error('Não foi possível remover o investimento', 'Erro');
        this.removendoId = null;
      },
    });
  }

  ganhoDe(id: string): GanhoInvestimento | null {
    return this.ganhos.find((g) => g.id === id) ?? null;
  }

  /**
   * Ticker cadastrado mas sem cotação nesse mês = ativo não passou no filtro de price > 0
   * da ingestão (StatusInvestService) — não está mais sendo negociado, não é "sem dado".
   */
  naoNegociavel(inv: Investimento): boolean {
    return !!inv.ticker && this.ganhoDe(inv.id)?.cotacaoAtual == null;
  }

  get valorInvestidoTotal(): number {
    return this.ganhos.reduce((acc, g) => acc + g.valorInvestido, 0);
  }

  get valorAtualTotal(): number | null {
    if (this.ganhos.some((g) => g.valorAtual === null)) return null;
    return this.ganhos.reduce((acc, g) => acc + (g.valorAtual ?? 0), 0);
  }

  get ganhoTotal(): number | null {
    const atual = this.valorAtualTotal;
    return atual !== null ? atual - this.valorInvestidoTotal : null;
  }

  formatMoeda(v: number | null): string {
    if (v === null) return '—';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatPercentual(v: number | null): string {
    return v !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '—';
  }

  classeGanho(v: number | null): string {
    if (v === null) return 'ganho--vazio';
    return v >= 0 ? 'ganho--positivo' : 'ganho--negativo';
  }

  formatMes(anoMes: string): string {
    if (!anoMes) return '';
    const [ano, mes] = anoMes.split('-');
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[+mes]}/${ano}`;
  }
}
