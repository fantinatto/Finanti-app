import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BalanceamentoSetor,
  GanhoInvestimento,
  Investimento,
  PortfolioConfig,
  RecomendacaoHolding,
  SaudeCarteira,
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

  // anoMes ignorado aqui — só existe pra CarteiraApi ter a mesma assinatura que SimulacaoService
  // (que usa o parâmetro pra carimbar o log de operações da simulação).
  criarInvestimento(payload: UpsertInvestimentoPayload, _anoMes?: string): Observable<Investimento> {
    return this.http.post<Investimento>('/portfolio/investimentos', payload);
  }

  atualizarInvestimento(id: string, payload: UpsertInvestimentoPayload): Observable<Investimento> {
    return this.http.put<Investimento>(`/portfolio/investimentos/${id}`, payload);
  }

  removerInvestimento(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/portfolio/investimentos/${id}`);
  }

  // anoMes ignorado aqui — a carteira real não usa cotação de mercado pra registrar venda,
  // só existe no parâmetro pra CarteiraApi ter a mesma assinatura que SimulacaoService.
  // precoVenda, se informado, espelha a venda como uma OperacaoFiscal no backend (ver
  // FiscalService/docs/FEATURE_SPEC_FISCAL.md) — omitido, comportamento antigo (sem fiscal).
  venderInvestimento(id: string, quantidade: number, _anoMes?: string, precoVenda?: number, custosFiscais?: number): Observable<unknown> {
    return this.http.post(`/portfolio/investimentos/${id}/vender`, { quantidade, precoVenda, custosFiscais });
  }

  getGanhosInvestimentos(anoMes: string): Observable<GanhoInvestimento[]> {
    return this.http.get<GanhoInvestimento[]>('/portfolio/investimentos/ganhos', { params: { anoMes } });
  }

  getRecomendacoesInvestimentos(anoMes: string): Observable<RecomendacaoHolding[]> {
    return this.http.get<RecomendacaoHolding[]>('/portfolio/investimentos/recomendacoes', { params: { anoMes } });
  }

  getBalanceamentoInvestimentos(anoMes: string): Observable<BalanceamentoSetor[]> {
    return this.http.get<BalanceamentoSetor[]>('/portfolio/investimentos/balanceamento', { params: { anoMes } });
  }

  getSaudeInvestimentos(anoMes: string): Observable<SaudeCarteira> {
    return this.http.get<SaudeCarteira>('/portfolio/investimentos/saude', { params: { anoMes } });
  }
}
