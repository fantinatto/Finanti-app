import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { MarketDataService } from '../../../services/market-data.service';
import { HistoricoCarteiraService } from '../../../services/historico-carteira.service';
import { TickerBusca } from '../../../interfaces/market-data.interfaces';
import {
  BalanceamentoSetor,
  CategoriaAcao,
  GanhoInvestimento,
  Investimento,
  RecomendacaoHolding,
  SaudeCarteira,
  TipoCarteira,
  TipoInvestimento,
  UpsertInvestimentoPayload,
} from '../../../interfaces/portfolio.interfaces';
import { HistoricoCarteira } from '../../../interfaces/simulacao.interfaces';

/** Contrato que PortfolioService e SimulacaoService satisfazem estruturalmente — permite tratar
 * "carteira real" e "carteira de simulação" como a mesma tela, injetando o service certo. */
export interface CarteiraApi {
  listarInvestimentos(): Observable<Investimento[]>;
  /** anoMes só é usado pela Simulação (carimba a TransacaoSimulacao do log de operações) — a
   * carteira real ignora o parâmetro. */
  criarInvestimento(payload: UpsertInvestimentoPayload, anoMes?: string): Observable<Investimento>;
  atualizarInvestimento(id: string, payload: UpsertInvestimentoPayload): Observable<Investimento>;
  removerInvestimento(id: string): Observable<{ ok: boolean }>;
  /** anoMes só é usado pela Simulação (apura ganho realizado/caixa pela cotação do mês) — a
   * carteira real ignora o parâmetro, só ajusta a quantidade. precoVenda/custosFiscais só têm
   * efeito na carteira real (espelha a venda como OperacaoFiscal) — a Simulação os ignora, já
   * tem seu próprio fluxo de ganho realizado baseado na cotação do anoMes. */
  venderInvestimento(id: string, quantidade: number, anoMes?: string, precoVenda?: number, custosFiscais?: number): Observable<unknown>;
  getGanhosInvestimentos(anoMes: string): Observable<GanhoInvestimento[]>;
  getRecomendacoesInvestimentos(anoMes: string): Observable<RecomendacaoHolding[]>;
  getBalanceamentoInvestimentos(anoMes: string): Observable<BalanceamentoSetor[]>;
  getSaudeInvestimentos(anoMes: string): Observable<SaudeCarteira>;
}

const LABEL_TIPO: Record<TipoInvestimento, string> = {
  acao: 'Ação',
  fii: 'FII',
  renda_fixa: 'Renda Fixa',
};

/** Rótulo + classe de cor do badge — 1:1 com a categoria que o backend já decidiu (matriz de decisão em investimento.service.ts). */
const CATEGORIA_META: Record<CategoriaAcao, { label: string; classe: string }> = {
  aportar: { label: 'Aportar', classe: 'cat--aporte' },
  troca_sugerida: { label: 'Troca sugerida', classe: 'cat--troca' },
  venda_prioritaria: { label: 'Venda prioritária', classe: 'cat--venda' },
  reducao_risco: { label: 'Redução de risco', classe: 'cat--venda' },
  aguardar_caixa: { label: 'Aguardar caixa', classe: 'cat--manter' },
  manter: { label: 'Manter', classe: 'cat--manter' },
};

/** Rótulo + classe do badge de prioridade — 1:1 com PrioridadeAcao do backend. */
const PRIORIDADE_META: Record<'alta' | 'media' | 'baixa', { label: string; classe: string }> = {
  alta: { label: 'Alta', classe: 'prio--alta' },
  media: { label: 'Média', classe: 'prio--media' },
  baixa: { label: 'Baixa', classe: 'prio--baixa' },
};

/** Rótulo + classe do badge de status de balanceamento por setor — 1:1 com BalanceamentoSetor.status. */
const STATUS_SETOR_META: Record<BalanceamentoSetor['status'], { label: string; classe: string }> = {
  sobrealocado: { label: 'Sobrealocado', classe: 'status--sobrealocado' },
  subalocado: { label: 'Subalocado', classe: 'status--subalocado' },
  equilibrado: { label: 'Equilibrado', classe: 'status--equilibrado' },
};

interface FormInvestimento {
  tipo: TipoInvestimento;
  ticker: string;
  nome: string;
  precoMedio: number | null;
  quantidade: number | null;
  /** Só usado (e exibido) na carteira REAL — ver comentário do campo em UpsertInvestimentoDto. */
  registrarFiscal: boolean;
  dataOperacao: string;
  custosFiscais: number | null;
}

/** Função (não const) pra `dataOperacao` sempre nascer com o dia de hoje, nunca a data em que o
 * bundle foi servido. */
function formVazio(): FormInvestimento {
  return {
    tipo: 'acao',
    ticker: '',
    nome: '',
    precoMedio: null,
    quantidade: null,
    registrarFiscal: true,
    dataOperacao: new Date().toISOString().slice(0, 10),
    custosFiscais: null,
  };
}

/**
 * Base compartilhada por /investimentos (carteira real) e /simulacao (carteira de simulação) —
 * as duas telas são "idênticas" por pedido explícito, então CRUD/ganhos/recomendações/histórico
 * vivem aqui uma única vez. Subclasses só injetam a API certa (this.api) e o valor de
 * this.carteira, e podem adicionar comportamento próprio (ex: SimulacaoComponent adiciona
 * executar/aporte/reiniciar por cima do que já existe aqui).
 */
@Directive()
export abstract class CarteiraBaseComponent implements OnInit, OnDestroy {
  abstract readonly carteira: TipoCarteira;
  protected abstract readonly api: CarteiraApi;

  readonly labelTipo = LABEL_TIPO;

  investimentos: Investimento[] = [];
  /** Só tipo 'acao' — os únicos com score/ranking. Guardado à parte (não getter) pra não
   * recriar o array a cada change detection (mesma lição do travamento em Coleta). */
  acoesInvestidas: Investimento[] = [];
  ganhos: GanhoInvestimento[] = [];
  recomendacoes: RecomendacaoHolding[] = [];
  balanceamento: BalanceamentoSetor[] = [];
  saude: SaudeCarteira | null = null;
  historico: HistoricoCarteira[] = [];

  meses: string[] = [];
  anoMesSelecionado = '';

  form: FormInvestimento = formVazio();
  editandoId: string | null = null;

  /** Search-help do campo Ticker (autocomplete) — só cobre tipo 'acao' (única fonte com
   * fundamentos ingeridos, ver Acao/IndicadorMensal). Debounce evita 1 request por tecla. */
  resultadosBuscaTicker: TickerBusca[] = [];
  buscandoTicker = false;
  private buscaTicker$ = new Subject<string>();

  carregando = false;
  carregandoGanhos = false;
  carregandoRecomendacoes = false;
  carregandoBalanceamento = false;
  carregandoSaude = false;
  carregandoHistorico = false;
  salvando = false;
  removendoId: string | null = null;
  vendendoId: string | null = null;

  constructor(
    protected marketData: MarketDataService,
    protected historicoCarteira: HistoricoCarteiraService,
    protected toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.carregarInvestimentos();
    this.carregarHistorico();
    this.marketData.getMeses().subscribe({
      next: (meses) => {
        this.meses = meses;
        if (meses.length) {
          this.anoMesSelecionado = meses[0];
          this.carregarGanhos();
        }
      },
    });

    this.buscaTicker$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) => (termo.trim().length >= 2 ? this.marketData.buscarTickers(termo) : of([]))),
      )
      .subscribe({
        next: (resultados) => {
          this.resultadosBuscaTicker = resultados;
          this.buscandoTicker = false;
        },
        error: () => { this.buscandoTicker = false; },
      });
  }

  ngOnDestroy(): void {
    this.buscaTicker$.complete();
  }

  carregarInvestimentos(): void {
    this.carregando = true;
    this.api.listarInvestimentos().subscribe({
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
    this.api.getGanhosInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.ganhos = dados;
        this.carregandoGanhos = false;
      },
      error: () => { this.carregandoGanhos = false; },
    });

    this.carregandoRecomendacoes = true;
    this.api.getRecomendacoesInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.recomendacoes = dados;
        // O backend já ordena por prioridade de execução — reordena a tabela pra seguir a mesma
        // ordem (acoesInvestidas vem de listarInvestimentos, sem noção de prioridade nenhuma).
        const ordem = new Map(dados.map((r, idx) => [r.id, idx]));
        this.acoesInvestidas = [...this.acoesInvestidas].sort(
          (a, b) => (ordem.get(a.id) ?? Infinity) - (ordem.get(b.id) ?? Infinity),
        );
        this.carregandoRecomendacoes = false;
      },
      error: () => { this.carregandoRecomendacoes = false; },
    });

    this.carregandoBalanceamento = true;
    this.api.getBalanceamentoInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.balanceamento = dados;
        this.carregandoBalanceamento = false;
      },
      error: () => { this.carregandoBalanceamento = false; },
    });

    this.carregandoSaude = true;
    this.api.getSaudeInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.saude = dados;
        this.carregandoSaude = false;
      },
      error: () => { this.carregandoSaude = false; },
    });
  }

  carregarHistorico(): void {
    this.carregandoHistorico = true;
    this.historicoCarteira.listar(this.carteira).subscribe({
      next: (dados) => {
        this.historico = dados;
        this.carregandoHistorico = false;
      },
      error: () => { this.carregandoHistorico = false; },
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

  prioridadeLabel(prioridade: RecomendacaoHolding['prioridade']): string {
    return prioridade ? PRIORIDADE_META[prioridade].label : '—';
  }

  prioridadeClasse(prioridade: RecomendacaoHolding['prioridade']): string {
    return prioridade ? PRIORIDADE_META[prioridade].classe : 'prio--vazia';
  }

  statusSetorLabel(status: BalanceamentoSetor['status']): string {
    return STATUS_SETOR_META[status].label;
  }

  statusSetorClasse(status: BalanceamentoSetor['status']): string {
    return STATUS_SETOR_META[status].classe;
  }

  /** Texto da recomendação — junta troca (se houver) e valor de rebalanceamento (se houver) numa frase só. */
  textoRecomendacao(r: RecomendacaoHolding): string {
    const valor = r.valorSugerido != null ? this.formatMoeda(Math.abs(r.valorSugerido)) : null;
    // Quantidade já vem pronta do backend (mesma unidade lote/fracionário que seria executada) —
    // evita recalcular no front dividindo valor por cotação, que exigiria buscar a cotação de
    // novo e podia divergir do arredondamento já aplicado no servidor.
    const qtd = r.quantidadeSugerida != null ? ` (${r.quantidadeSugerida})` : '';

    if (r.sugestaoTroca) {
      // troca_sugerida é sempre migração de 100% da posição — sem valor parcial associado, mesmo
      // quando o setor ainda está subalocado (ver motivoTroca pro aviso de que o déficit continua).
      const alvo = `${r.sugestaoTroca.ticker} (${this.formatScore(r.sugestaoTroca.scoreFinal)})`;
      return `Migrar para ${alvo}`;
    }

    if (r.sugestaoRebalanceamento === 'comprar') return `Comprar ${valor}${qtd}`;
    if (r.sugestaoRebalanceamento === 'vender') return `Vender ${valor}${qtd}`;
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

  /** Disparado no (input) do campo Ticker — dispara a busca via Subject debounced. */
  onTickerInput(valor: string): void {
    this.form.ticker = valor;
    if (this.form.tipo !== 'acao') return; // só ações têm fundamentos ingeridos (ver Acao)
    this.buscandoTicker = valor.trim().length >= 2;
    this.buscaTicker$.next(valor);
  }

  /** Preenche nome e preço sugerido a partir do resultado escolhido — preço fica editável em
   * seguida (é o preço de fechamento mais recente conhecido, não necessariamente o preço real
   * que o usuário pagou na compra). */
  selecionarTicker(resultado: TickerBusca): void {
    this.form.ticker = resultado.ticker;
    this.form.nome = resultado.nome;
    if (resultado.precoFechamento != null) this.form.precoMedio = resultado.precoFechamento;
    this.resultadosBuscaTicker = [];
  }

  /** setTimeout pra deixar o (click) de selecionarTicker disparar antes do dropdown fechar
   * (blur do input dispara antes do click no item da lista). */
  fecharBuscaTicker(): void {
    setTimeout(() => { this.resultadosBuscaTicker = []; }, 150);
  }

  editar(inv: Investimento): void {
    this.editandoId = inv.id;
    // Edição nunca espelha no Fiscal (ver comentário do campo no DTO) — é uma correção da
    // posição, não necessariamente uma operação nova. registrarFiscal/dataOperacao/custosFiscais
    // ficam nos valores padrão, sem efeito (o backend só lê esses campos em criarInvestimento).
    this.form = {
      tipo: inv.tipo,
      ticker: inv.ticker ?? '',
      nome: inv.nome,
      precoMedio: inv.precoMedio,
      quantidade: inv.quantidade,
      registrarFiscal: false,
      dataOperacao: new Date().toISOString().slice(0, 10),
      custosFiscais: null,
    };
    this.resultadosBuscaTicker = [];
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.form = formVazio();
    this.resultadosBuscaTicker = [];
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

    // registrarFiscal só faz sentido na CRIAÇÃO da carteira REAL (edição é uma correção da
    // posição, não uma operação nova — ver comentário do campo no DTO/backend).
    if (!this.editandoId && this.carteira === 'real' && this.precisaTicker) {
      payload.registrarFiscal = this.form.registrarFiscal;
      payload.dataOperacao = this.form.dataOperacao;
      payload.custosFiscais = this.form.custosFiscais ?? 0;
    }

    const eraEdicao = this.editandoId !== null;
    const request = eraEdicao
      ? this.api.atualizarInvestimento(this.editandoId as string, payload)
      : this.api.criarInvestimento(payload, this.anoMesSelecionado);

    request.subscribe({
      next: () => {
        this.toastr.success(eraEdicao ? 'Investimento atualizado' : 'Investimento cadastrado', 'Carteira');
        this.salvando = false;
        this.cancelarEdicao();
        this.carregarInvestimentos();
        if (!eraEdicao) this.onInvestimentoCriado();
      },
      error: () => {
        this.toastr.error('Não foi possível salvar o investimento', 'Erro');
        this.salvando = false;
      },
    });
  }

  /** Hook pra subclasses reagirem a uma criação nova (não edição) — Simulação sobrescreve pra
   * atualizar caixaDisponivel/log de operações (SimulacaoService.criar debita caixa e registra
   * TransacaoSimulacao quando a posição criada tem ticker). */
  protected onInvestimentoCriado(): void {}

  remover(inv: Investimento): void {
    if (this.removendoId) return;
    this.removendoId = inv.id;
    this.api.removerInvestimento(inv.id).subscribe({
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

  /**
   * Venda parcial/total — só ajusta a quantidade (real) ou, na Simulação, também registra
   * transação/ganho realizado/caixa (ver SimulacaoService.venderManual). Usa prompt() em vez de
   * um modal novo — ação pontual, não justifica um componente extra ainda.
   */
  vender(inv: Investimento): void {
    if (this.vendendoId || !inv.ticker) return;

    const entrada = window.prompt(`Quantas unidades de ${inv.ticker} você vendeu? (possui ${inv.quantidade})`, String(inv.quantidade));
    if (entrada === null) return; // cancelado

    const quantidade = Number(entrada.replace(',', '.'));
    if (!quantidade || quantidade <= 0 || quantidade > inv.quantidade) {
      this.toastr.error(`Quantidade inválida — você possui ${inv.quantidade} unidades`, 'Erro');
      return;
    }

    // Só a carteira REAL pergunta o preço — a venda nunca é ambígua (é sempre uma operação de
    // hoje), então já registra no Fiscal automaticamente se um preço válido for informado.
    // Simulação já sabe a cotação pelo anoMes selecionado, não precisa perguntar nada.
    let precoVenda: number | undefined;
    if (this.carteira === 'real') {
      const entradaPreco = window.prompt(
        `Preço de venda por unidade de ${inv.ticker} (deixe em branco pra não registrar no Fiscal):`,
      );
      if (entradaPreco !== null && entradaPreco.trim() !== '') {
        const precoNumerico = Number(entradaPreco.replace(',', '.'));
        if (!precoNumerico || precoNumerico <= 0) {
          this.toastr.error('Preço de venda inválido — venda não registrada.', 'Erro');
          return;
        }
        precoVenda = precoNumerico;
      }
    }

    this.vendendoId = inv.id;
    this.api.venderInvestimento(inv.id, quantidade, this.anoMesSelecionado, precoVenda).subscribe({
      next: () => {
        const sufixoFiscal = precoVenda != null ? ' (também registrada no Fiscal)' : '';
        this.toastr.success(`Venda de ${quantidade} ${inv.ticker} registrada${sufixoFiscal}`, 'Carteira');
        this.vendendoId = null;
        if (this.editandoId === inv.id) this.cancelarEdicao();
        this.carregarInvestimentos();
        this.onVendaRegistrada();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível registrar a venda', 'Erro');
        this.vendendoId = null;
      },
    });
  }

  /** Hook pra subclasses reagirem a uma venda manual — Simulação sobrescreve pra atualizar
   * caixaDisponivel/ganhoRealizado (a venda credita os dois, ver SimulacaoService.venderManual). */
  protected onVendaRegistrada(): void {}

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

  /** Gráfico de evolução (histórico mensal) — um snapshot por mês, criado sob demanda ao
   * carregar ganhos (ver HistoricoCarteiraService.garantirSnapshotDoMes no backend). Com menos
   * de 2 pontos o gráfico não diz muito, mas ainda renderiza (1 ponto ou vazio). */
  get chartData(): ChartData<'line'> {
    return {
      labels: this.historico.map((h) => this.formatMes(h.anoMes)),
      datasets: [
        {
          label: 'Valor total',
          data: this.historico.map((h) => h.valorTotal),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.15)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Valor investido',
          data: this.historico.map((h) => h.valorInvestidoTotal),
          borderColor: '#94a3b8',
          borderDash: [4, 4],
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }

  get chartOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: (v) => this.formatMoeda(Number(v)) } } },
    };
  }
}
