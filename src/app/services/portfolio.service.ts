import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GanhoInvestimento,
  Investimento,
  PortfolioConfig,
  RecomendacaoHolding,
  SugestaoRegra,
  UpsertInvestimentoPayload,
  UpsertPortfolioConfigPayload,
} from '../interfaces/portfolio.interfaces';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  constructor(private http: HttpClient) {}

  getConfig(): Observable<PortfolioConfig | null> {
    return this.http.get<PortfolioConfig | null>('/portfolio/config');
  }

  upsertConfig(payload: UpsertPortfolioConfigPayload): Observable<PortfolioConfig> {
    return this.http.put<PortfolioConfig>('/portfolio/config', payload);
  }

  getSugestaoBase(base: number): Observable<SugestaoRegra> {
    return this.http.get<SugestaoRegra>('/portfolio/regras/sugestao', { params: { base } });
  }

  getSugestaoDi(base: number): Observable<SugestaoRegra> {
    return this.http.get<SugestaoRegra>('/portfolio/regras/sugestao-di', { params: { base } });
  }

  listarInvestimentos(): Observable<Investimento[]> {
    return this.http.get<Investimento[]>('/portfolio/investimentos');
  }

  criarInvestimento(payload: UpsertInvestimentoPayload): Observable<Investimento> {
    return this.http.post<Investimento>('/portfolio/investimentos', payload);
  }

  atualizarInvestimento(id: string, payload: UpsertInvestimentoPayload): Observable<Investimento> {
    return this.http.put<Investimento>(`/portfolio/investimentos/${id}`, payload);
  }

  removerInvestimento(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/portfolio/investimentos/${id}`);
  }

  getGanhosInvestimentos(anoMes: string): Observable<GanhoInvestimento[]> {
    return this.http.get<GanhoInvestimento[]>('/portfolio/investimentos/ganhos', { params: { anoMes } });
  }

  getRecomendacoesInvestimentos(anoMes: string): Observable<RecomendacaoHolding[]> {
    return this.http.get<RecomendacaoHolding[]>('/portfolio/investimentos/recomendacoes', { params: { anoMes } });
  }
}
