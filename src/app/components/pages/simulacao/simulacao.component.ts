import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SimulacaoService } from '../../../services/simulacao.service';
import { MarketDataService } from '../../../services/market-data.service';
import { HistoricoCarteiraService } from '../../../services/historico-carteira.service';
import { TipoCarteira } from '../../../interfaces/portfolio.interfaces';
import { SimulacaoConfig, TransacaoSimulacao } from '../../../interfaces/simulacao.interfaces';
import { CarteiraApi, CarteiraBaseComponent } from '../investimentos/carteira-base.component';

/** Únicas categorias de recomendação com venda real — 'aportar' orienta o PRÓXIMO aporte, não
 * uma venda da posição de hoje (ver plano da feature). */
const CATEGORIAS_EXECUTAVEIS: ReadonlySet<string> = new Set(['venda_prioritaria', 'reducao_risco', 'troca_sugerida']);

const LABEL_ORIGEM: Record<TransacaoSimulacao['origem'], string> = {
  manual: 'Manual',
  recomendacao: 'Recomendação',
  aporte_semanal: 'Aporte semanal',
  caixa: 'Investir caixa',
  reinicio: 'Reinício',
};

@Component({
  selector: 'app-simulacao',
  templateUrl: './simulacao.component.html',
  styleUrls: ['./simulacao.component.scss'],
})
export class SimulacaoComponent extends CarteiraBaseComponent {
  readonly carteira: TipoCarteira = 'simulacao';
  protected readonly api: CarteiraApi;

  config: SimulacaoConfig = { aporteSemanalValor: 0, caixaDisponivel: 0, ultimoAporteAplicadoEm: null, simulacaoIniciadaEm: null };
  aporteSemanalForm: number | null = null;
  carregandoConfig = false;
  salvandoConfig = false;
  reiniciando = false;
  aplicandoAporte = false;
  investindoCaixa = false;
  executandoId: string | null = null;
  confirmandoReinicio = false;

  /** Toggle entre a tabela do motor legado (default) e o Preview do Search Engine — ver plano
   * "Preview do Search Engine". Puramente de exibição, não afeta nenhum dado carregado. */
  abaRecomendacoes: 'legado' | 'preview' = 'legado';

  /** Lucro/prejuízo já apurado em vendas (ver TransacaoSimulacao.ganhoRealizado) — sem isso, o
   * "Ganho" do resumo (não-realizado, baseado só nas posições atuais) não refletia o lucro de
   * uma venda depois que o dinheiro era reinvestido (o novo precoMedio reseta o ganho embutido). */
  ganhoRealizado = 0;

  /** Log de tudo que já foi feito na simulação (mais recente primeiro) — pra o usuário replicar
   * manualmente na carteira real (ex: "comprou 100 ações de VULC3"). */
  transacoes: TransacaoSimulacao[] = [];
  carregandoTransacoes = false;

  constructor(
    private simulacaoService: SimulacaoService,
    marketData: MarketDataService,
    historicoCarteira: HistoricoCarteiraService,
    toastr: ToastrService,
  ) {
    super(marketData, historicoCarteira, toastr);
    this.api = simulacaoService;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.carregarConfig();
    this.carregarGanhoRealizado();
    this.carregarTransacoes();
  }

  /** Venda manual credita caixaDisponivel e ganhoRealizado (ver SimulacaoService.venderManual) —
   * atualiza os dois cards, mesma reação que executarRecomendacao já dispara. Também gera uma
   * TransacaoSimulacao, então atualiza o log também. */
  protected override onVendaRegistrada(): void {
    this.carregarConfig();
    this.carregarGanhoRealizado();
    this.carregarTransacoes();
  }

  /** Compra manual ("Adicionar") debita caixaDisponivel e registra uma TransacaoSimulacao — ver
   * SimulacaoService.criar. */
  protected override onInvestimentoCriado(): void {
    this.carregarConfig();
    this.carregarTransacoes();
  }

  carregarGanhoRealizado(): void {
    this.simulacaoService.getGanhoRealizado().subscribe({
      next: (res) => { this.ganhoRealizado = res.ganhoRealizado; },
    });
  }

  carregarTransacoes(): void {
    this.carregandoTransacoes = true;
    this.simulacaoService.listarTransacoes().subscribe({
      next: (dados) => {
        this.transacoes = dados;
        this.carregandoTransacoes = false;
      },
      error: () => { this.carregandoTransacoes = false; },
    });
  }

  carregarConfig(): void {
    this.carregandoConfig = true;
    this.simulacaoService.getConfig().subscribe({
      next: (c) => {
        this.config = c;
        this.aporteSemanalForm = c.aporteSemanalValor;
        this.carregandoConfig = false;
      },
      error: () => { this.carregandoConfig = false; },
    });
  }

  salvarAporteSemanal(): void {
    if (this.aporteSemanalForm == null || this.aporteSemanalForm < 0 || this.salvandoConfig) return;
    this.salvandoConfig = true;
    this.simulacaoService.upsertConfig({ aporteSemanalValor: this.aporteSemanalForm }).subscribe({
      next: (c) => {
        this.config = c;
        this.toastr.success('Aporte semanal atualizado', 'Simulação');
        this.salvandoConfig = false;
      },
      error: () => {
        this.toastr.error('Não foi possível salvar o aporte semanal', 'Erro');
        this.salvandoConfig = false;
      },
    });
  }

  pedirConfirmacaoReinicio(): void {
    this.confirmandoReinicio = true;
  }

  cancelarReinicio(): void {
    this.confirmandoReinicio = false;
  }

  confirmarReinicio(): void {
    if (this.reiniciando) return;
    this.reiniciando = true;
    this.simulacaoService.reiniciar().subscribe({
      next: () => {
        this.toastr.success('Simulação reiniciada a partir da carteira real', 'Simulação');
        this.reiniciando = false;
        this.confirmandoReinicio = false;
        this.carregarInvestimentos();
        this.carregarConfig();
        this.carregarHistorico();
        this.carregarGanhoRealizado();
        this.carregarTransacoes(); // reiniciar apaga TransacaoSimulacao — log some/some zera
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível reiniciar a simulação', 'Erro');
        this.reiniciando = false;
      },
    });
  }

  aplicarAporte(): void {
    if (!this.anoMesSelecionado || this.aplicandoAporte) return;
    this.aplicandoAporte = true;
    this.simulacaoService.aplicarAporte(this.anoMesSelecionado).subscribe({
      next: (res) => {
        if (res.semanasAplicadas === 0) {
          this.toastr.info('Nenhuma semana completa desde o último aporte', 'Simulação');
        } else {
          // Aporte só credita caixa agora — não compra nada sozinho (ver AplicarAporteResultado).
          this.toastr.success(`${this.formatMoeda(res.valorAportado)} creditado(s) no caixa disponível (${res.semanasAplicadas} semana(s))`, 'Simulação');
        }
        this.aplicandoAporte = false;
        this.carregarConfig();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível aplicar o aporte semanal', 'Erro');
        this.aplicandoAporte = false;
      },
    });
  }

  investirCaixa(): void {
    if (!this.anoMesSelecionado || this.investindoCaixa || this.config.caixaDisponivel <= 0) return;
    this.investindoCaixa = true;
    this.simulacaoService.investirCaixa(this.anoMesSelecionado).subscribe({
      next: (res) => {
        this.toastr.success(`${this.formatMoeda(res.valorInvestido)} de caixa investidos`, 'Simulação');
        this.investindoCaixa = false;
        this.carregarInvestimentos();
        this.carregarConfig();
        this.carregarTransacoes();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível investir o caixa', 'Erro');
        this.investindoCaixa = false;
      },
    });
  }

  /** Motor novo (Next Best Action) executa por dentro de `RecommendationPreviewComponent` — essa
   * tela só fica sabendo via `(executado)`. Mesma reação de `executarRecomendacao` (o
   * equivalente do motor legado): recarrega holdings/caixa/ganho realizado/log. */
  onNextBestActionExecutada(): void {
    this.carregarInvestimentos();
    this.carregarConfig();
    this.carregarGanhoRealizado();
    this.carregarTransacoes();
  }

  categoriaExecutavel(categoria: string): boolean {
    return CATEGORIAS_EXECUTAVEIS.has(categoria);
  }

  origemLabel(origem: TransacaoSimulacao['origem']): string {
    return LABEL_ORIGEM[origem] ?? origem;
  }

  executarRecomendacao(investimentoId: string): void {
    if (!this.anoMesSelecionado || this.executandoId) return;
    this.executandoId = investimentoId;
    this.simulacaoService.executarRecomendacao(investimentoId, this.anoMesSelecionado).subscribe({
      next: () => {
        this.toastr.success('Recomendação executada', 'Simulação');
        this.executandoId = null;
        this.carregarInvestimentos();
        this.carregarConfig(); // reducao_risco credita caixaDisponivel — atualiza o card
        this.carregarGanhoRealizado(); // toda venda apura ganho/prejuízo — ver ganhoRealizado
        this.carregarTransacoes();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível executar a recomendação', 'Erro');
        this.executandoId = null;
      },
    });
  }
}
