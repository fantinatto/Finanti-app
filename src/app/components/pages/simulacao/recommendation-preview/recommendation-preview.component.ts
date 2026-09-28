import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SimulacaoService } from '../../../../services/simulacao.service';
import { CandidateOutcomePreview, PortfolioMovePreview, RecommendationPreviewResult, RecommendationPreviewStep } from '../../../../interfaces/portfolio.interfaces';

const LABEL_TIPO_MOVE: Record<PortfolioMovePreview['type'], string> = {
  BUY: 'Reforçar',
  ADD_NEW_POSITION: 'Abrir posição',
  REDUCE: 'Reduzir',
  SELL: 'Vender',
  ROTATE_WITHIN_SECTOR: 'Trocar',
};

const LABEL_SIZING: Record<string, string> = {
  REDUCE_TO_UPPER_BAND: 'até a banda superior',
  REDUCE_PARTIAL: 'parcial',
  REDUCE_TO_TARGET: 'até o target',
  FULL_EXIT: 'saída total',
};

/**
 * Preview do motor novo (Search Engine depth=3 + Decision Trace) — só leitura, deliberadamente
 * PARALELO à tabela "Ranking das suas ações" (motor legado) na tela de Simulação. Busca sob
 * demanda (botão), não carrega automático junto com o resto da tela.
 */
@Component({
  selector: 'app-recommendation-preview',
  templateUrl: './recommendation-preview.component.html',
  styleUrls: ['./recommendation-preview.component.scss'],
})
export class RecommendationPreviewComponent implements OnChanges {
  @Input() anoMes = '';

  /** A execução real (venda/compra) acontece por dentro deste componente, mas quem mostra
   * caixa/holdings/log de transações/ganho realizado é o `SimulacaoComponent` pai — sem esse
   * evento, a tela só refletia a execução depois de um F5 manual (achado real: usuário reportou
   * "não atualiza, só quando dou refresh"). */
  @Output() executado = new EventEmitter<void>();

  preview: RecommendationPreviewResult | null = null;
  carregando = false;
  erro: string | null = null;

  executando = false;
  executarErro: string | null = null;
  executarSucesso: string | null = null;

  constructor(private readonly simulacaoService: SimulacaoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Troca de mês invalida o preview já carregado — força o usuário a pedir de novo, em vez de
    // mostrar um plano calculado pra outro anoMes sem avisar.
    if (changes['anoMes'] && !changes['anoMes'].firstChange) {
      this.preview = null;
      this.erro = null;
    }
  }

  carregar(): void {
    if (!this.anoMes || this.carregando) return;
    this.carregando = true;
    this.erro = null;
    this.executarErro = null;
    this.executarSucesso = null;
    this.simulacaoService.getRecommendationPreview(this.anoMes).subscribe({
      next: (resultado) => { this.preview = resultado; this.carregando = false; },
      error: () => { this.erro = 'Não foi possível calcular o preview do motor novo.'; this.carregando = false; },
    });
  }

  /**
   * Executa de verdade a `nextBestAction` — nunca `projectedPath` (não existe botão pra isso na
   * tela, de propósito). Backend recalcula tudo e SÓ executa se a ação recalculada bater com a
   * fingerprint/hash que este componente confirmou aqui — se a carteira mudou nesse meio-tempo
   * (409), recarrega a preview automaticamente em vez de insistir na ação antiga.
   */
  executar(): void {
    const nba = this.preview?.bestPlan.nextBestAction;
    const fingerprint = this.preview?.bestPlan.nextBestActionFingerprint;
    const snapshotHash = this.preview?.snapshot.snapshotHash;
    if (!nba || !fingerprint || !snapshotHash || this.executando) return;

    this.executando = true;
    this.executarErro = null;
    this.executarSucesso = null;
    this.simulacaoService.executarNextBestAction(this.anoMes, fingerprint, snapshotHash).subscribe({
      next: (resultado) => {
        this.executando = false;
        this.executarSucesso =
          resultado.status === 'ALREADY_EXECUTED'
            ? 'Essa ação já tinha sido executada (confirmação duplicada ignorada).'
            : `Executado: ${this.labelMove(nba.move)} ${this.tickerMove(nba.move)}.`;
        this.preview = null; // força recálculo — a linha antiga não vale mais depois da execução real
        this.executado.emit(); // avisa o pai (SimulacaoComponent) a recarregar caixa/holdings/log
      },
      error: (err) => {
        this.executando = false;
        if (err?.status === 409) {
          this.executarErro = 'A carteira mudou desde este preview — revise a nova recomendação.';
          this.carregar();
        } else {
          this.executarErro = 'Não foi possível executar a ação agora.';
        }
      },
    });
  }

  labelMove(move: PortfolioMovePreview): string {
    return LABEL_TIPO_MOVE[move.type] ?? move.type;
  }

  labelSizing(move: PortfolioMovePreview): string | null {
    return move.sizingStrategy ? (LABEL_SIZING[move.sizingStrategy] ?? move.sizingStrategy) : null;
  }

  tickerMove(move: PortfolioMovePreview): string {
    if (move.type === 'ROTATE_WITHIN_SECTOR') return `${move.sourceTicker} → ${move.targetTicker}`;
    return move.targetTicker ?? move.sourceTicker ?? '—';
  }

  descreverAlternativa(alt: { moves: PortfolioMovePreview[] }): string {
    return alt.moves.map((m) => `${this.labelMove(m)} ${this.tickerMove(m)}`).join(' → ');
  }

  /** Candidatos que REALMENTE competiram (chegaram ao Comparator) — nunca conta
   * `MOVE_ORDERING_CUT`/`DOMINATED`/`INVALID` como "alternativa rejeitada", pra não repetir o
   * erro que motivou separar o lifecycle (ver plano "Decision Trace: lifecycle real"). */
  alternativasAvaliadas(step: RecommendationPreviewStep): CandidateOutcomePreview[] {
    return step.candidateOutcomes.filter((o) => o.lifecycle === 'EVALUATED');
  }

  /** Candidatos válidos que nunca chegaram a ser avaliados — cortados pelo orçamento de
   * expansão (`maxMovesPerNode`), não pelo Comparator. */
  candidatosNaoAvaliados(step: RecommendationPreviewStep): number {
    return step.candidateOutcomes.filter((o) => o.lifecycle === 'MOVE_ORDERING_CUT').length;
  }

  formatMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatScore(valor: number | null): string {
    return valor == null ? '—' : valor.toFixed(2);
  }

  formatPontos(valor: number): string {
    return valor.toFixed(2);
  }
}
