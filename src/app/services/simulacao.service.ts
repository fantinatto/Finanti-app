import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BalanceamentoSetor, ExecutarNextBestActionResultPreview, GanhoInvestimento, Investimento, RecomendacaoHolding, RecommendationPreviewResult, SaudeCarteira, UpsertInvestimentoPayload } from '../interfaces/portfolio.interfaces';
import { AplicarAporteResultado, InvestirCaixaResultado, SimulacaoConfig, TransacaoSimulacao, UpsertSimulacaoConfigPayload } from '../interfaces/simulacao.interfaces';

/** Espelha PortfolioService nas rotas /portfolio/simulacao/* — mesma forma de método (nome e
 * assinatura) pra que CarteiraBaseComponent trate os dois services como intercambiáveis. */
@Injectable({ providedIn: 'root' })
export class SimulacaoService {
  constructor(private http: HttpClient) {}

  getConfig(): Observable<SimulacaoConfig> {
    return this.http.get<SimulacaoConfig>('/portfolio/simulacao/config');
  }

  upsertConfig(payload: UpsertSimulacaoConfigPayload): Observable<SimulacaoConfig> {
    return this.http.put<SimulacaoConfig>('/portfolio/simulacao/config', payload);
  }

  reiniciar(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>('/portfolio/simulacao/reiniciar', {});
  }

  listarInvestimentos(): Observable<Investimento[]> {
    return this.http.get<Investimento[]>('/portfolio/simulacao/investimentos');
  }

  // anoMes carimba a TransacaoSimulacao gerada por essa compra (ver SimulacaoService.criar no
  // backend) — sem isso o log de operações não saberia a que competência atribuir a compra.
  criarInvestimento(payload: UpsertInvestimentoPayload, anoMes?: string): Observable<Investimento> {
    return this.http.post<Investimento>('/portfolio/simulacao/investimentos', payload, { params: anoMes ? { anoMes } : {} });
  }

  atualizarInvestimento(id: string, payload: UpsertInvestimentoPayload): Observable<Investimento> {
    return this.http.put<Investimento>(`/portfolio/simulacao/investimentos/${id}`, payload);
  }

  removerInvestimento(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/portfolio/simulacao/investimentos/${id}`);
  }

  // anoMes obrigatório aqui — a venda precisa da cotação do mês pra apurar ganho realizado
  // e creditar caixaDisponivel (ver SimulacaoService.venderManual no backend). precoVenda/
  // custosFiscais são ignorados — Simulação não é dinheiro real, não tem implicação fiscal;
  // os parâmetros só existem pra satisfazer a assinatura compartilhada de CarteiraApi.
  venderInvestimento(id: string, quantidade: number, anoMes?: string, _precoVenda?: number, _custosFiscais?: number): Observable<unknown> {
    return this.http.post(`/portfolio/simulacao/investimentos/${id}/vender`, { quantidade }, { params: { anoMes: anoMes ?? '' } });
  }

  getGanhosInvestimentos(anoMes: string): Observable<GanhoInvestimento[]> {
    return this.http.get<GanhoInvestimento[]>('/portfolio/simulacao/investimentos/ganhos', { params: { anoMes } });
  }

  getRecomendacoesInvestimentos(anoMes: string): Observable<RecomendacaoHolding[]> {
    return this.http.get<RecomendacaoHolding[]>('/portfolio/simulacao/investimentos/recomendacoes', { params: { anoMes } });
  }

  getBalanceamentoInvestimentos(anoMes: string): Observable<BalanceamentoSetor[]> {
    return this.http.get<BalanceamentoSetor[]>('/portfolio/simulacao/investimentos/balanceamento', { params: { anoMes } });
  }

  getSaudeInvestimentos(anoMes: string): Observable<SaudeCarteira> {
    return this.http.get<SaudeCarteira>('/portfolio/simulacao/investimentos/saude', { params: { anoMes } });
  }

  executarRecomendacao(investimentoId: string, anoMes: string): Observable<TransacaoSimulacao[]> {
    return this.http.post<TransacaoSimulacao[]>(`/portfolio/simulacao/investimentos/${investimentoId}/executar-recomendacao`, {}, { params: { anoMes } });
  }

  aplicarAporte(anoMes: string): Observable<AplicarAporteResultado> {
    return this.http.post<AplicarAporteResultado>('/portfolio/simulacao/aplicar-aporte', {}, { params: { anoMes } });
  }

  investirCaixa(anoMes: string): Observable<InvestirCaixaResultado> {
    return this.http.post<InvestirCaixaResultado>('/portfolio/simulacao/investir-caixa', {}, { params: { anoMes } });
  }

  getGanhoRealizado(): Observable<{ ganhoRealizado: number }> {
    return this.http.get<{ ganhoRealizado: number }>('/portfolio/simulacao/ganho-realizado');
  }

  /** Log completo de tudo que já aconteceu na simulação, mais recente primeiro — pra replicar
   * manualmente na carteira real. */
  listarTransacoes(): Observable<TransacaoSimulacao[]> {
    return this.http.get<TransacaoSimulacao[]>('/portfolio/simulacao/transacoes');
  }

  /** Preview do motor novo (Search Engine depth=3 + Decision Trace) — só leitura, deliberadamente
   * PARALELO a `getRecomendacoesInvestimentos` (motor legado) acima. Rota compartilhada entre
   * real/simulação via query `carteira`. */
  getRecommendationPreview(anoMes: string): Observable<RecommendationPreviewResult> {
    return this.http.get<RecommendationPreviewResult>('/portfolio/recommendation-engine/preview', { params: { anoMes, carteira: 'simulacao' } });
  }

  /** Executa de verdade a `nextBestAction` do Preview — ver plano "Next Best Action". Pode
   * responder 409 (`NextBestActionChangedErrorPreview`) se a carteira mudou desde o Preview
   * confirmado; o componente decide o que fazer com isso (recarregar a preview), nunca re-tenta
   * sozinho aqui. */
  executarNextBestAction(anoMes: string, expectedActionFingerprint: string, expectedSnapshotHash: string): Observable<ExecutarNextBestActionResultPreview> {
    return this.http.post<ExecutarNextBestActionResultPreview>(
      '/portfolio/simulacao/next-best-action/executar',
      { expectedActionFingerprint, expectedSnapshotHash },
      { params: { anoMes, carteira: 'simulacao' } },
    );
  }
}
