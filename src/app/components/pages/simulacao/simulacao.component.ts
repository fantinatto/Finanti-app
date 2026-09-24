import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SimulacaoService } from '../../../services/simulacao.service';
import { MarketDataService } from '../../../services/market-data.service';
import { HistoricoCarteiraService } from '../../../services/historico-carteira.service';
import { TipoCarteira } from '../../../interfaces/portfolio.interfaces';
import { SimulacaoConfig } from '../../../interfaces/simulacao.interfaces';
import { CarteiraApi, CarteiraBaseComponent } from '../investimentos/carteira-base.component';

/** Únicas categorias de recomendação com venda real — aporte_direcionado/aportar orientam o
 * PRÓXIMO aporte, não uma venda da posição de hoje (ver plano da feature). */
const CATEGORIAS_EXECUTAVEIS: ReadonlySet<string> = new Set(['venda_prioritaria', 'reducao_risco', 'troca_sugerida']);

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
          this.toastr.success(`${res.semanasAplicadas} semana(s) de aporte aplicada(s)`, 'Simulação');
        }
        this.aplicandoAporte = false;
        this.carregarInvestimentos();
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
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível investir o caixa', 'Erro');
        this.investindoCaixa = false;
      },
    });
  }

  categoriaExecutavel(categoria: string): boolean {
    return CATEGORIAS_EXECUTAVEIS.has(categoria);
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
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Não foi possível executar a recomendação', 'Erro');
        this.executandoId = null;
      },
    });
  }
}
