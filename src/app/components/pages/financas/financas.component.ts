import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FinancasService } from '../../../services/financas.service';
import {
  CATEGORIAS_CARTAO,
  FORMAS_PAGAMENTO,
  GanhoMensal,
  GastoMensal,
  MesFinanceiro,
  MesHistorico,
  ResumoCategoria,
  TransacaoCartao,
} from '../../../interfaces/financas.interfaces';

const MESES_LABEL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface FormGasto {
  nome: string;
  formaPagamento: string;
  valor: number | null;
  pago: boolean;
  dataVencimento: string;
}

interface FormGanho {
  nome: string;
  valor: number | null;
  recebido: boolean;
}

type AbaFinancas = 'geral' | 'lancamentos' | 'cartao';

@Component({
  selector: 'app-financas',
  templateUrl: './financas.component.html',
  styleUrls: ['./financas.component.scss'],
})
export class FinancasComponent implements OnInit {
  readonly formasPagamento = FORMAS_PAGAMENTO;
  readonly categoriasCartao = CATEGORIAS_CARTAO;

  anoMesSelecionado = '';
  mes: MesFinanceiro | null = null;
  carregando = false;

  editandoGastoId: string | null = null;
  formGasto: FormGasto = this.formGastoVazio();

  editandoGanhoId: string | null = null;
  formGanho: FormGanho = this.formGanhoVazio();

  historico: MesHistorico[] = [];
  carregandoHistorico = false;

  transacoesCartao: TransacaoCartao[] = [];
  resumoCategoria: ResumoCategoria[] = [];
  carregandoTransacoes = false;
  importando = false;
  mensagemImport = '';
  recalculandoPrevisoes = false;

  fechandoMes = false;

  abaAtiva: AbaFinancas = 'geral';

  constructor(private readonly financas: FinancasService) {}

  setAba(aba: AbaFinancas): void {
    this.abaAtiva = aba;
  }

  ngOnInit(): void {
    const hoje = new Date();
    this.anoMesSelecionado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    this.carregarMes();
    this.carregarHistorico();
  }

  carregarMes(): void {
    this.carregando = true;
    this.financas.getMes(this.anoMesSelecionado).subscribe({
      next: (mes) => { this.mes = mes; this.carregando = false; },
      error: () => { this.carregando = false; },
    });
    this.carregarTransacoesCartao();
  }

  carregarHistorico(): void {
    this.carregandoHistorico = true;
    this.financas.getHistorico(12).subscribe({
      next: (historico) => { this.historico = historico; this.carregandoHistorico = false; },
      error: () => { this.carregandoHistorico = false; },
    });
  }

  mudarMes(delta: number): void {
    const [ano, mesNum] = this.anoMesSelecionado.split('-').map(Number);
    const data = new Date(ano, mesNum - 1 + delta, 1);
    this.anoMesSelecionado = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    this.cancelarEdicaoGasto();
    this.cancelarEdicaoGanho();
    this.mensagemImport = '';
    this.carregarMes();
  }

  // ── Fechamento mensal ───────────────────────────────────────────────────────

  fecharMes(): void {
    this.fechandoMes = true;
    this.financas.fecharMes(this.anoMesSelecionado).subscribe({
      next: () => { this.fechandoMes = false; this.carregarMes(); },
      error: () => { this.fechandoMes = false; },
    });
  }

  reabrirMes(): void {
    this.fechandoMes = true;
    this.financas.reabrirMes(this.anoMesSelecionado).subscribe({
      next: () => { this.fechandoMes = false; this.carregarMes(); },
      error: () => { this.fechandoMes = false; },
    });
  }

  // ── Gráfico histórico (Ganhos x Gastos) ─────────────────────────────────────

  get chartDataHistorico(): ChartData<'bar'> {
    return {
      labels: this.historico.map((h) => this.formatMesLabel(h.anoMes)),
      datasets: [
        { label: 'Ganhos', data: this.historico.map((h) => h.totalGanhos), backgroundColor: '#22C55E' },
        { label: 'Gastos', data: this.historico.map((h) => h.totalGastos), backgroundColor: '#ef4444' },
      ],
    };
  }

  get chartOptionsHistorico(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      animation: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: (v) => this.formatMoeda(Number(v)) } } },
    };
  }

  // ── Gráfico de maiores categorias de gasto no cartão ────────────────────────

  get chartDataCategorias(): ChartData<'bar'> {
    const top = this.resumoCategoria.slice(0, 5);
    return {
      labels: top.map((r) => r.categoria),
      datasets: [{ data: top.map((r) => r.total), backgroundColor: '#ef4444' }],
    };
  }

  get chartOptionsCategorias(): ChartConfiguration<'bar'>['options'] {
    return {
      indexAxis: 'y',
      responsive: true,
      animation: false,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { callback: (v) => this.formatMoeda(Number(v)) } } },
    };
  }

  // ── Transações de cartão (import de fatura) ─────────────────────────────────

  /** Rascunho de categoria/"não reconheço" por transação — alterar aqui NÃO salva nem recarrega
   * nada; só o clique em "Salvar" (ver salvarLinha) persiste, pra não interromper o preenchimento
   * de várias linhas seguidas com um refresh da tabela a cada campo. */
  rascunhoCategoria: Record<string, string> = {};
  rascunhoNaoReconhecida: Record<string, boolean> = {};

  carregarTransacoesCartao(): void {
    this.carregandoTransacoes = true;
    this.financas.listarTransacoesCartao(this.anoMesSelecionado).subscribe({
      next: (transacoes) => {
        this.transacoesCartao = transacoes;
        this.rascunhoCategoria = Object.fromEntries(transacoes.map((t) => [t.id, t.categoria ?? '']));
        this.rascunhoNaoReconhecida = Object.fromEntries(transacoes.map((t) => [t.id, t.naoReconhecida]));
        this.carregandoTransacoes = false;
        this.carregarResumoCategoria();
      },
      error: () => { this.carregandoTransacoes = false; },
    });
  }

  carregarResumoCategoria(): void {
    this.financas.getResumoCategoriaCartao(this.anoMesSelecionado).subscribe((resumo) => (this.resumoCategoria = resumo));
  }

  onArquivoFaturaSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    input.value = '';
    if (!arquivo) return;

    this.importando = true;
    this.mensagemImport = '';
    this.financas.importarFatura(this.anoMesSelecionado, arquivo).subscribe({
      next: (resultado) => {
        this.importando = false;
        this.mensagemImport = resultado.ignoradasDuplicadas > 0
          ? `${resultado.importadas} transações importadas (${resultado.ignoradasDuplicadas} já existiam, não duplicadas).`
          : `${resultado.importadas} transações importadas.`;
        this.carregarTransacoesCartao();
      },
      error: (err) => {
        this.importando = false;
        this.mensagemImport = err?.message ?? 'Não foi possível importar a fatura.';
      },
    });
  }

  categoriaAlterada(t: TransacaoCartao): boolean {
    return (this.rascunhoCategoria[t.id] ?? '').trim() !== (t.categoria ?? '').trim();
  }

  naoReconhecidaAlterada(t: TransacaoCartao): boolean {
    return (this.rascunhoNaoReconhecida[t.id] ?? false) !== t.naoReconhecida;
  }

  linhaAlterada(t: TransacaoCartao): boolean {
    return this.categoriaAlterada(t) || this.naoReconhecidaAlterada(t);
  }

  get linhasAlteradas(): TransacaoCartao[] {
    return this.transacoesCartao.filter((t) => this.linhaAlterada(t));
  }

  get temAlteracoesPendentes(): boolean {
    return this.linhasAlteradas.length > 0;
  }

  salvandoAlteracoes = false;

  /** Único botão "Salvar alterações" pra todas as linhas — salva categoria e "não reconheço" de
   * uma vez só para quem mudou, em paralelo, e só então atualiza o resumo. Digitar/marcar não
   * persiste nada por si só; nada é enviado até esse clique. */
  salvarTodasAlteracoes(): void {
    const pendentes = this.linhasAlteradas;
    if (!pendentes.length) return;

    this.salvandoAlteracoes = true;
    const alguemMudouCategoria = pendentes.some((t) => this.categoriaAlterada(t));

    forkJoin(pendentes.map((t) => this.salvarLinha$(t))).subscribe({
      next: () => {
        this.salvandoAlteracoes = false;
        if (alguemMudouCategoria) this.carregarResumoCategoria();
      },
      error: () => { this.salvandoAlteracoes = false; },
    });
  }

  private salvarLinha$(t: TransacaoCartao): Observable<void> {
    const categoria = (this.rascunhoCategoria[t.id] ?? '').trim();
    const naoReconhecida = this.rascunhoNaoReconhecida[t.id] ?? false;
    const categoriaMudou = this.categoriaAlterada(t);
    const naoReconhecidaMudou = this.naoReconhecidaAlterada(t);

    const categoria$ = categoriaMudou
      ? this.financas.atualizarCategoriaTransacaoCartao(t.id, categoria || null)
      : of(t);
    const naoReconhecida$ = naoReconhecidaMudou
      ? naoReconhecida ? this.financas.marcarNaoReconhecida(t.id) : this.financas.desmarcarNaoReconhecida(t.id)
      : of(t);

    return forkJoin([categoria$, naoReconhecida$]).pipe(
      map(([porCategoria, porNaoReconhecida]) => {
        if (categoriaMudou) t.categoria = porCategoria.categoria;
        if (naoReconhecidaMudou) t.naoReconhecida = porNaoReconhecida.naoReconhecida;
        this.rascunhoCategoria[t.id] = t.categoria ?? '';
        this.rascunhoNaoReconhecida[t.id] = t.naoReconhecida;
      }),
    );
  }

  removerTransacaoCartao(id: string): void {
    this.financas.removerTransacaoCartao(id).subscribe(() => this.carregarTransacoesCartao());
  }

  recalcularPrevisoesParcelas(): void {
    this.recalculandoPrevisoes = true;
    this.financas.recalcularPrevisoesParcelas().subscribe({
      next: ({ criadas }) => {
        this.recalculandoPrevisoes = false;
        this.mensagemImport = `${criadas} parcela(s) futura(s) projetada(s).`;
        this.carregarTransacoesCartao();
      },
      error: () => { this.recalculandoPrevisoes = false; },
    });
  }

  get totalTransacoesCartao(): number {
    return this.transacoesCartao.reduce((acc, t) => acc + t.valor, 0);
  }

  /** Sugere sincronizar a linha "Cartão de Crédito" (GastoMensal) quando a soma das transações
   * importadas divergir do que está lançado — nunca automático, só um aviso com valor pronto. */
  get gastoCartaoDivergente(): GastoMensal | null {
    if (!this.mes || !this.transacoesCartao.length) return null;
    const linhaCartao = this.mes.gastos.find((g) => g.formaPagamento === 'Cartão de Crédito');
    if (!linhaCartao) return null;
    return Math.abs(linhaCartao.valor - this.totalTransacoesCartao) > 0.01 ? linhaCartao : null;
  }

  sincronizarGastoCartao(): void {
    const linha = this.gastoCartaoDivergente;
    if (!linha) return;
    this.financas.atualizarGasto(linha.id, {
      nome: linha.nome,
      formaPagamento: linha.formaPagamento ?? undefined,
      valor: this.totalTransacoesCartao,
      pago: linha.pago,
      dataVencimento: linha.dataVencimento ?? undefined,
    }).subscribe(() => this.carregarMes());
  }

  formatMesLabel(anoMes: string): string {
    const [ano, mesNum] = anoMes.split('-').map(Number);
    return `${MESES_LABEL[mesNum - 1]}/${ano}`;
  }

  // ── Gastos ────────────────────────────────────────────────────────────────

  iniciarEdicaoGasto(g: GastoMensal): void {
    this.editandoGastoId = g.id;
    this.formGasto = {
      nome: g.nome,
      formaPagamento: g.formaPagamento ?? '',
      valor: g.valor,
      pago: g.pago,
      dataVencimento: this.toDateInputValue(g.dataVencimento),
    };
  }

  cancelarEdicaoGasto(): void {
    this.editandoGastoId = null;
    this.formGasto = this.formGastoVazio();
  }

  salvarGasto(): void {
    if (!this.formGasto.nome.trim() || this.formGasto.valor === null) return;
    const payload = {
      nome: this.formGasto.nome.trim(),
      formaPagamento: this.formGasto.formaPagamento || undefined,
      valor: this.formGasto.valor,
      pago: this.formGasto.pago,
      dataVencimento: this.formGasto.dataVencimento || undefined,
    };
    const obs = this.editandoGastoId
      ? this.financas.atualizarGasto(this.editandoGastoId, payload)
      : this.financas.criarGasto(this.anoMesSelecionado, payload);
    obs.subscribe(() => { this.cancelarEdicaoGasto(); this.carregarMes(); });
  }

  removerGasto(id: string): void {
    this.financas.removerGasto(id).subscribe(() => {
      if (this.editandoGastoId === id) this.cancelarEdicaoGasto();
      this.carregarMes();
    });
  }

  togglePago(g: GastoMensal): void {
    this.financas
      .atualizarGasto(g.id, {
        nome: g.nome,
        formaPagamento: g.formaPagamento ?? undefined,
        valor: g.valor,
        pago: !g.pago,
        dataVencimento: g.dataVencimento ? this.toDateInputValue(g.dataVencimento) : undefined,
      })
      .subscribe(() => this.carregarMes());
  }

  percentualGasto(g: GastoMensal): string {
    if (!this.mes || this.mes.totalGastos <= 0) return '—';
    return `${((g.valor / this.mes.totalGastos) * 100).toFixed(1)}%`;
  }

  // ── Ganhos ────────────────────────────────────────────────────────────────

  iniciarEdicaoGanho(g: GanhoMensal): void {
    this.editandoGanhoId = g.id;
    this.formGanho = { nome: g.nome, valor: g.valor, recebido: g.recebido };
  }

  cancelarEdicaoGanho(): void {
    this.editandoGanhoId = null;
    this.formGanho = this.formGanhoVazio();
  }

  salvarGanho(): void {
    if (!this.formGanho.nome.trim() || this.formGanho.valor === null) return;
    const payload = { nome: this.formGanho.nome.trim(), valor: this.formGanho.valor, recebido: this.formGanho.recebido };
    const obs = this.editandoGanhoId
      ? this.financas.atualizarGanho(this.editandoGanhoId, payload)
      : this.financas.criarGanho(this.anoMesSelecionado, payload);
    obs.subscribe(() => { this.cancelarEdicaoGanho(); this.carregarMes(); });
  }

  removerGanho(id: string): void {
    this.financas.removerGanho(id).subscribe(() => {
      if (this.editandoGanhoId === id) this.cancelarEdicaoGanho();
      this.carregarMes();
    });
  }

  toggleRecebido(g: GanhoMensal): void {
    this.financas.atualizarGanho(g.id, { nome: g.nome, valor: g.valor, recebido: !g.recebido }).subscribe(() => this.carregarMes());
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatMoeda(v: number | null): string {
    if (v === null) return '—';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatData(iso: string | null): string {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }

  toDateInputValue(iso: string | null): string {
    return iso ? iso.slice(0, 10) : '';
  }

  formatPercentual(v: number | null): string {
    return v !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '—';
  }

  /** Pra variação de gastos: subir é ruim (vermelho), cair é bom (verde) — inverso de ganho. */
  classeVariacaoGastos(v: number | null): string {
    if (v === null) return '';
    return v > 0 ? 'indicador--negativo' : v < 0 ? 'indicador--positivo' : '';
  }

  private formGastoVazio(): FormGasto {
    return { nome: '', formaPagamento: '', valor: null, pago: false, dataVencimento: '' };
  }

  private formGanhoVazio(): FormGanho {
    return { nome: '', valor: null, recebido: false };
  }
}
