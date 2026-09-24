import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GanhoInvestimento, Investimento, RecomendacaoHolding, UpsertInvestimentoPayload } from '../interfaces/portfolio.interfaces';
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

  criarInvestimento(payload: UpsertInvestimentoPayload): Observable<Investimento> {
    return this.http.post<Investimento>('/portfolio/simulacao/investimentos', payload);
  }

  atualizarInvestimento(id: string, payload: UpsertInvestimentoPayload): Observable<Investimento> {
    return this.http.put<Investimento>(`/portfolio/simulacao/investimentos/${id}`, payload);
  }

  removerInvestimento(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/portfolio/simulacao/investimentos/${id}`);
  }

  getGanhosInvestimentos(anoMes: string): Observable<GanhoInvestimento[]> {
    return this.http.get<GanhoInvestimento[]>('/portfolio/simulacao/investimentos/ganhos', { params: { anoMes } });
  }

  getRecomendacoesInvestimentos(anoMes: string): Observable<RecomendacaoHolding[]> {
    return this.http.get<RecomendacaoHolding[]>('/portfolio/simulacao/investimentos/recomendacoes', { params: { anoMes } });
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
}
