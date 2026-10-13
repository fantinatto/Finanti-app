import { Component } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { PortfolioService } from '../../../services/portfolio.service';
import { MarketDataService } from '../../../services/market-data.service';
import { HistoricoCarteiraService } from '../../../services/historico-carteira.service';
import {
  BalanceamentoSegmentoFii,
  BalanceamentoSetor,
  BalanceamentoSetorFii,
  CenarioSimulacaoRendaFixa,
  DiversificacaoCarteira,
  FatiaDiversificacao,
  Investimento,
  RecomendacaoHoldingFii,
  ResultadoSimulacaoRendaFixa,
  ResumoDiversificacao,
  SaudeCarteiraFii,
  TipoCarteira,
  TipoInvestimento,
} from '../../../interfaces/portfolio.interfaces';
import { CarteiraApi, CarteiraBaseComponent } from './carteira-base.component';

/** 'geral' = dashboard-resumo (estado padrão); as outras 3 são as visões dedicadas por pilar,
 * abertas clicando numa fatia do gráfico de diversificação na visão geral. Substitui o antigo
 * VisaoDiversificacao (que só trocava o gráfico) — agora a página inteira reage. */
type VisaoPagina = 'geral' | 'acoes' | 'fii' | 'rendaFixa';

const CORES_DIVERSIFICACAO = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#84cc16', '#ec4899'];

/** Some da tela (só em /investimentos, ver pedido do usuário) grupos sem alvo configurado E
 * sem posição hoje — não ajudam em nada, só poluem a tabela (ex: segmentos da lista antiga que
 * nunca tiveram % configurado nem FII correspondente). Mantém qualquer linha com alvo>0 OU
 * posição>0, incluindo "setor descoberto" (alvo configurado, zero posição). */
function temAlvoOuPosicao(b: { percentualAlvo: number; valorAtual: number }): boolean {
  return b.percentualAlvo > 0 || b.valorAtual > 0;
}

@Component({
  selector: 'app-investimentos',
  templateUrl: './investimentos.component.html',
  styleUrls: ['./investimentos.component.scss'],
})
export class InvestimentosComponent extends CarteiraBaseComponent {
  readonly carteira: TipoCarteira = 'real';
  protected readonly api: CarteiraApi;

  /** Visão ativa da página — ver comentário do tipo. */
  visaoPagina: VisaoPagina = 'geral';

  /** Gráfico de diversificação — fora de CarteiraApi de propósito (só existe em /investimentos,
   * ver comentário em portfolio.service.ts). Os 3 agrupamentos (macro/porSetorAcao/
   * porTipoFundoFii) já vêm juntos de getDiversificacao, reaproveitados conforme visaoPagina. */
  diversificacao: DiversificacaoCarteira | null = null;
  carregandoDiversificacao = false;

  /** Só na visão 'geral' — quanto a composição macro atual (Ações/FIIs/Renda Fixa) está
   * alinhada ao alvo configurado em Carteira (ver getResumoDiversificacao). Complementa o
   * gráfico de composição (que não mostra alvo) com um número direto de "falta diversificar". */
  resumoDiversificacao: ResumoDiversificacao | null = null;
  carregandoResumoDiversificacao = false;

  /** Espelha o painel "Balanceamento por setor" (ações), mas pra FII por segmento — mesmo alvo
   * configurado em Carteira (AlocacaoSegmentoFii, dentro de "FIIs"). Também fora de CarteiraApi,
   * mesma razão da diversificação. */
  balanceamentoFii: BalanceamentoSegmentoFii[] = [];
  carregandoBalanceamentoFii = false;

  /** Mesma ideia, mas pro "setor" de FII (tipo de fundo) — dimensão independente do segmento,
   * ver comentário de BalanceamentoSetorFii. */
  balanceamentoSetorFii: BalanceamentoSetorFii[] = [];
  carregandoBalanceamentoSetorFii = false;

  /** "Saúde da carteira (FIIs)" — espelha `saude` (ações, da base class), mas com os 4 pilares
   * do ranking de FII. Não existe em CarteiraApi (só /investimentos tem visão por pilar). */
  saudeFii: SaudeCarteiraFii | null = null;
  carregandoSaudeFii = false;

  /** "Ranking dos seus FIIs" — agora com recomendação completa (getRecomendacoesFii), mesma
   * paridade que "Ranking das suas ações" já tem: compara a alocação real do SEGMENTO contra o
   * alvo (AlocacaoSegmentoFii) e sugere aportar/vender/trocar, com prioridade de execução. Já
   * carrega os mesmos 4 scores do ranking puro (scoreValuation/Renda/LiquidezPorte/Preservação)
   * — substituiu o antigo rankingMeusFiis (ranking sem recomendação). */
  recomendacoesFii: RecomendacaoHoldingFii[] = [];
  carregandoRecomendacoesFii = false;

  /** No 1º carregamento da página, ~6 chamadas independentes (ganhos, balanceamento,
   * diversificação, balanceamento de FII x2, saúde de FII...) voltam em sequência, cada uma
   * disparando change detection — e os getters de dado do gráfico (chartDataDiversificacao etc.)
   * criam um array NOVO a cada ciclo, então o ng2-charts via o "data" como tendo mudado a cada
   * rodada e reanimava o gráfico várias vezes seguidas (visualmente "pulando"). Enquanto isso
   * estiver true, os cards de gráfico mostram um spinner em vez do <canvas> — o gráfico só nasce
   * depois que todo o dado relevante já chegou, uma vez só. */
  get carregandoGraficos(): boolean {
    return (
      this.carregando ||
      this.carregandoHistorico ||
      this.carregandoDiversificacao ||
      this.carregandoBalanceamento ||
      this.carregandoBalanceamentoFii ||
      this.carregandoBalanceamentoSetorFii
    );
  }

  constructor(
    private portfolioService: PortfolioService,
    marketData: MarketDataService,
    historicoCarteira: HistoricoCarteiraService,
    toastr: ToastrService,
  ) {
    super(marketData, historicoCarteira, toastr);
    this.api = portfolioService;
  }

  override carregarGanhos(): void {
    super.carregarGanhos();
    this.carregarDiversificacao();
    this.carregarResumoDiversificacao();
    this.carregarBalanceamentoFii();
    this.carregarBalanceamentoSetorFii();
    this.carregarSaudeFii();
    this.carregarRecomendacoesFii();
  }

  carregarDiversificacao(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoDiversificacao = true;
    this.portfolioService.getDiversificacaoInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.diversificacao = dados;
        this.carregandoDiversificacao = false;
      },
      error: () => { this.carregandoDiversificacao = false; },
    });
  }

  carregarResumoDiversificacao(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoResumoDiversificacao = true;
    this.portfolioService.getResumoDiversificacaoInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.resumoDiversificacao = dados;
        this.carregandoResumoDiversificacao = false;
      },
      error: () => { this.carregandoResumoDiversificacao = false; },
    });
  }

  carregarBalanceamentoFii(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoBalanceamentoFii = true;
    this.portfolioService.getBalanceamentoFiiInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.balanceamentoFii = dados;
        this.carregandoBalanceamentoFii = false;
      },
      error: () => { this.carregandoBalanceamentoFii = false; },
    });
  }

  carregarBalanceamentoSetorFii(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoBalanceamentoSetorFii = true;
    this.portfolioService.getBalanceamentoSetorFiiInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.balanceamentoSetorFii = dados;
        this.carregandoBalanceamentoSetorFii = false;
      },
      error: () => { this.carregandoBalanceamentoSetorFii = false; },
    });
  }

  carregarSaudeFii(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoSaudeFii = true;
    this.portfolioService.getSaudeFiiInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.saudeFii = dados;
        this.carregandoSaudeFii = false;
      },
      error: () => { this.carregandoSaudeFii = false; },
    });
  }

  carregarRecomendacoesFii(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoRecomendacoesFii = true;
    this.portfolioService.getRecomendacoesFiiInvestimentos(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.recomendacoesFii = dados;
        this.carregandoRecomendacoesFii = false;
      },
      error: () => { this.carregandoRecomendacoesFii = false; },
    });
  }

  recomendacaoFiiDe(id: string): RecomendacaoHoldingFii | null {
    return this.recomendacoesFii.find((r) => r.id === id) ?? null;
  }

  /** Cópia pequena de textoRecomendacao (base class, carteira-base.component.ts:316) — mesma
   * lógica exata, type diferente (não dava pra reusar direto sem generalizar a base, que não é
   * tocada nesta feature). */
  textoRecomendacaoFii(r: RecomendacaoHoldingFii): string {
    const valor = r.valorSugerido != null ? this.formatMoeda(Math.abs(r.valorSugerido)) : null;
    const qtd = r.quantidadeSugerida != null ? ` (${r.quantidadeSugerida})` : '';

    if (r.sugestaoTroca) {
      // Mesmo tratamento de "Depois, aportar" de textoRecomendacao (ações) — valorSugerido aqui
      // já considera o alvo macro de FIIs (ver valorBaseRateioFiis no backend).
      const alvo = `${r.sugestaoTroca.ticker} (${this.formatScore(r.sugestaoTroca.scoreFinal)})`;
      const aporte = r.sugestaoRebalanceamento === 'comprar' && valor != null ? ` · depois, aportar ~${valor}${qtd}` : '';
      return `Migrar para ${alvo}${aporte}`;
    }

    if (r.sugestaoRebalanceamento === 'comprar') return `Comprar ${valor}${qtd}`;
    if (r.sugestaoRebalanceamento === 'vender') return `Vender ${valor}${qtd}`;
    return '—';
  }

  get balanceamentoVisivel(): BalanceamentoSetor[] {
    return this.balanceamento.filter(temAlvoOuPosicao);
  }

  get balanceamentoFiiVisivel(): BalanceamentoSegmentoFii[] {
    return this.balanceamentoFii.filter(temAlvoOuPosicao);
  }

  get balanceamentoSetorFiiVisivel(): BalanceamentoSetorFii[] {
    return this.balanceamentoSetorFii.filter(temAlvoOuPosicao);
  }

  /**
   * Troca a visão de página — se não estiver editando um investimento, reseta o formulário
   * (cancelarEdicao já existente) e pré-seleciona o Tipo default do pilar (o usuário ainda pode
   * trocar manualmente no dropdown, é só um default). Chamado pelo clique nas fatias do gráfico
   * geral e pelos botões de navegação por pilar.
   */
  mudarVisao(visao: VisaoPagina): void {
    this.visaoPagina = visao;
    if (!this.editandoId) {
      this.cancelarEdicao();
      if (visao === 'acoes') this.form.tipo = 'acao';
      else if (visao === 'fii') this.form.tipo = 'fii';
      else if (visao === 'rendaFixa') this.form.tipo = 'renda_fixa';
      this.onTipoChange();
    }
    // Sem isso, trocar de visão a partir do meio/fim da página (ex: botão "Voltar" no rodapé, ou
    // clicar numa fatia do gráfico depois de rolar) deixa o scroll no mesmo pixel — como o
    // conteúdo da visão nova é diferente, o usuário pode cair no meio dela e nem ver o cabeçalho/
    // botão de voltar do topo. Sempre volta pro topo ao trocar de visão.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  get fatiasDiversificacaoAtual(): FatiaDiversificacao[] {
    if (!this.diversificacao) return [];
    // 'acoes' não usa mais este getter — ganhou 2 gráficos dedicados (status por setor +
    // composição por segmento), ver chartDataSetorStatus/chartDataSegmentoAcao.
    if (this.visaoPagina === 'fii') return this.diversificacao.porTipoFundoFii;
    if (this.visaoPagina === 'rendaFixa') return [];
    return this.diversificacao.macro;
  }

  get tituloDiversificacaoAtual(): string {
    if (this.visaoPagina === 'fii') return 'FIIs por tipo de fundo';
    return 'Diversificação da carteira';
  }

  get chartDataDiversificacao(): ChartData<'doughnut'> {
    const fatias = this.fatiasDiversificacaoAtual;
    return {
      labels: fatias.map((f) => f.chave),
      datasets: [{ data: fatias.map((f) => f.valor), backgroundColor: CORES_DIVERSIFICACAO }],
    };
  }

  get chartOptionsDiversificacao(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true,
      // Getter recria o array a cada change detection — sem isso, qualquer CD (ex: as ~6
      // chamadas independentes do 1º carregamento resolvendo em sequência) reanimava o gráfico
      // do zero de novo, "pulando" visualmente várias vezes. Ver carregandoGraficos também.
      animation: false,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const fatia = this.fatiasDiversificacaoAtual[ctx.dataIndex];
              return fatia ? ` ${fatia.chave}: ${this.formatMoeda(fatia.valor)} (${fatia.percentual.toFixed(1)}%)` : '';
            },
          },
        },
      },
    };
  }

  /**
   * "Ações por setor" — voltou a ser um doughnut único (a pedido do usuário, depois de passar
   * por barra horizontal, double doughnut e grade de gauges): 1 fatia por setor, tamanho = %
   * atual (igual ao doughnut de Diversificação), mas a cor da fatia indica o status do
   * balanceamento em vez da paleta fixa por categoria — vermelho sobrealocado, azul
   * subalocado, verde equilibrado (mesmo CORES_STATUS/paleta de .status-badge). O % alvo não
   * aparece mais visualmente no gráfico, só na tooltip.
   */
  private readonly CORES_STATUS: Record<string, string> = {
    sobrealocado: '#b91c1c',
    subalocado: '#1d4ed8',
    equilibrado: '#15803d',
  };

  get chartDataSetorStatus(): ChartData<'doughnut'> {
    const dados = this.balanceamentoVisivel;
    return {
      labels: dados.map((b) => b.setor),
      datasets: [{ data: dados.map((b) => b.percentualAtual), backgroundColor: dados.map((b) => this.CORES_STATUS[b.status]) }],
    };
  }

  get chartOptionsSetorStatus(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true,
      animation: false,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const b = this.balanceamentoVisivel[ctx.dataIndex];
              return b ? ` ${b.setor}: ${b.percentualAtual.toFixed(1)}% atual (alvo ${b.percentualAlvo.toFixed(1)}%)` : '';
            },
          },
        },
      },
    };
  }

  /** (chartClick) do ng2-charts — só a visão 'geral' tem drill-down (clicar muda a página
   * inteira pra visão do pilar); Renda Fixa não tem classificação pra agrupar mas ainda abre a
   * visão dedicada (só sem gráfico lá dentro). */
  onClickDiversificacao(event: { event?: ChartEvent; active?: object[] }): void {
    if (this.visaoPagina !== 'geral' || !this.diversificacao || !event.active?.length) return;
    const index = (event.active[0] as { index: number }).index;
    const fatia = this.diversificacao.macro[index];
    if (!fatia) return;

    if (fatia.chave === 'Ações') this.mudarVisao('acoes');
    else if (fatia.chave === 'FIIs') this.mudarVisao('fii');
    else if (fatia.chave === 'Renda Fixa') this.mudarVisao('rendaFixa');
  }

  /** Posições filtradas pela visão ativa — tabela principal reaproveita o mesmo template em
   * cada visão, só troca a fonte. 'geral' não é usado na tabela (ela só aparece dentro de uma
   * visão de pilar), mas mantido por completude. */
  get investimentosVisiveis(): Investimento[] {
    const tipo: TipoInvestimento | null =
      this.visaoPagina === 'acoes' ? 'acao' : this.visaoPagina === 'fii' ? 'fii' : this.visaoPagina === 'rendaFixa' ? 'renda_fixa' : null;
    return tipo ? this.investimentos.filter((i) => i.tipo === tipo) : this.investimentos;
  }

  /** saude-card é reaproveitado entre 'geral' e 'acoes' (mesmo dado `saude`, que já é ações-only
   * no backend) — só o título muda. */
  get tituloSaudeAtual(): string {
    return this.visaoPagina === 'acoes' ? 'Saúde da carteira (Ações)' : 'Saúde da carteira';
  }

  get tituloPilarAtual(): string {
    if (this.visaoPagina === 'acoes') return 'Ações';
    if (this.visaoPagina === 'fii') return 'FIIs';
    if (this.visaoPagina === 'rendaFixa') return 'Renda Fixa';
    return '';
  }

  /**
   * Evolução da carteira (visão geral) — cópia local do chartData/chartOptions da base class
   * (CarteiraBaseComponent, compartilhada com /simulacao) só com animation:false. Não dava pra
   * só adicionar animation:false na base sem afetar Simulação também (fora do escopo pedido), e
   * sem isso esse gráfico específico continuava "pulando" no 1º load pela mesma razão do de
   * diversificação: historico carrega numa chamada separada (carregarHistorico, disparada no
   * ngOnInit) e o getter recria o array a cada change detection.
   */
  get chartDataGeral(): ChartData<'line'> {
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

  get chartOptionsGeral(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      animation: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: (v) => this.formatMoeda(Number(v)) } } },
    };
  }

  /** Gráfico de Evolução por pilar — só 1 série (valor atual do pilar), diferente do chartData
   * da base (que também plota "valor investido" total, dado que não existe quebrado por pilar
   * em HistoricoCarteira). */
  get chartDataPorPilar(): ChartData<'line'> {
    const campo = this.visaoPagina === 'acoes' ? 'valorPorAcoes' : this.visaoPagina === 'fii' ? 'valorPorFiis' : 'valorPorRendaFixa';
    return {
      labels: this.historico.map((h) => this.formatMes(h.anoMes)),
      datasets: [
        {
          label: `Valor em ${this.tituloPilarAtual}`,
          data: this.historico.map((h) => h[campo]),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.15)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }

  get chartOptionsPorPilar(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      animation: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: (v) => this.formatMoeda(Number(v)) } } },
    };
  }

  /** Mesma tradução de código→texto já usada em ranking.component.ts (descricaoAlertaRisco) —
   * duplicada aqui de propósito, é um helper pequeno e os dois componentes não compartilham base. */
  descricaoAlertaRisco(alertaRisco: string | null): string {
    const partes: string[] = [];
    if (alertaRisco?.includes('desenvolvimento')) partes.push('Fundo de Desenvolvimento (risco de obra/orçamento) — Preservação penalizada em 15%');
    if (alertaRisco?.includes('dividend_trap')) partes.push('Dividend Trap (DY alto com cota caindo) — Renda penalizada em 10%');
    return partes.join(' | ');
  }

  get tituloVazioTabela(): string {
    if (this.visaoPagina === 'acoes') return 'Nenhuma ação cadastrada';
    if (this.visaoPagina === 'fii') return 'Nenhum FII cadastrado';
    if (this.visaoPagina === 'rendaFixa') return 'Nenhuma renda fixa cadastrada';
    return 'Nenhum investimento cadastrado';
  }

  // ── Simulador de Renda Fixa ("qual vale mais investir") ───────────────────────────────────
  // Cenários ad-hoc (não precisam ser posições salvas) — só existe na visão Renda Fixa.

  simulacaoCenarios: {
    nome: string;
    valorInvestido: number | null;
    tipoRentabilidade: 'cdi' | 'prefixado';
    percentualOuTaxa: number | null;
    dataAplicacao: string;
    dataVencimento: string;
    isentoIr: boolean;
  }[] = [this.cenarioVazio(), this.cenarioVazio()];

  simulacaoResultados: ResultadoSimulacaoRendaFixa[] = [];
  simulando = false;
  erroSimulacao: string | null = null;

  private cenarioVazio() {
    return {
      nome: '',
      valorInvestido: null,
      tipoRentabilidade: 'cdi' as const,
      percentualOuTaxa: null,
      dataAplicacao: new Date().toISOString().slice(0, 10),
      dataVencimento: '',
      isentoIr: false,
    };
  }

  adicionarCenarioSimulacao(): void {
    this.simulacaoCenarios.push(this.cenarioVazio());
  }

  removerCenarioSimulacao(index: number): void {
    this.simulacaoCenarios.splice(index, 1);
    this.simulacaoResultados = [];
  }

  get simulacaoValida(): boolean {
    return (
      this.simulacaoCenarios.length >= 2 &&
      this.simulacaoCenarios.every((c) => c.nome.trim() && c.valorInvestido != null && c.valorInvestido > 0 && c.percentualOuTaxa != null && c.dataVencimento)
    );
  }

  executarSimulacao(): void {
    if (!this.simulacaoValida || this.simulando) return;
    this.simulando = true;
    this.erroSimulacao = null;

    const cenarios: CenarioSimulacaoRendaFixa[] = this.simulacaoCenarios.map((c) => ({
      nome: c.nome.trim(),
      valorInvestido: c.valorInvestido as number,
      tipoRentabilidade: c.tipoRentabilidade,
      percentualOuTaxa: c.percentualOuTaxa as number,
      dataAplicacao: c.dataAplicacao,
      dataVencimento: c.dataVencimento,
      isentoIr: c.isentoIr,
    }));

    this.portfolioService.simularRendaFixa(cenarios).subscribe({
      next: (resultados) => { this.simulacaoResultados = resultados; this.simulando = false; },
      error: () => { this.erroSimulacao = 'Não foi possível calcular a simulação.'; this.simulando = false; },
    });
  }
}
