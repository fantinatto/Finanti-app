import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GanhoMensal,
  GastoMensal,
  ImportarFaturaResultado,
  MesFinanceiro,
  MesHistorico,
  ResumoCategoria,
  TransacaoCartao,
  UpsertGanhoPayload,
  UpsertGastoPayload,
} from '../interfaces/financas.interfaces';

@Injectable({ providedIn: 'root' })
export class FinancasService {
  constructor(private http: HttpClient) {}

  getMes(anoMes: string): Observable<MesFinanceiro> {
    return this.http.get<MesFinanceiro>(`/financas/${anoMes}`);
  }

  criarGasto(anoMes: string, payload: UpsertGastoPayload): Observable<GastoMensal> {
    return this.http.post<GastoMensal>(`/financas/${anoMes}/gastos`, payload);
  }

  atualizarGasto(id: string, payload: UpsertGastoPayload): Observable<GastoMensal> {
    return this.http.put<GastoMensal>(`/financas/gastos/${id}`, payload);
  }

  removerGasto(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/financas/gastos/${id}`);
  }

  criarGanho(anoMes: string, payload: UpsertGanhoPayload): Observable<GanhoMensal> {
    return this.http.post<GanhoMensal>(`/financas/${anoMes}/ganhos`, payload);
  }

  atualizarGanho(id: string, payload: UpsertGanhoPayload): Observable<GanhoMensal> {
    return this.http.put<GanhoMensal>(`/financas/ganhos/${id}`, payload);
  }

  removerGanho(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/financas/ganhos/${id}`);
  }

  fecharMes(anoMes: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`/financas/${anoMes}/fechar`, {});
  }

  reabrirMes(anoMes: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/financas/${anoMes}/fechar`);
  }

  getHistorico(meses = 12): Observable<MesHistorico[]> {
    return this.http.get<MesHistorico[]>('/financas/historico', { params: { meses } });
  }

  importarFatura(anoMes: string, arquivo: File): Observable<ImportarFaturaResultado> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<ImportarFaturaResultado>(`/financas/${anoMes}/importar-fatura`, formData);
  }

  listarTransacoesCartao(anoMes: string): Observable<TransacaoCartao[]> {
    return this.http.get<TransacaoCartao[]>(`/financas/${anoMes}/transacoes-cartao`);
  }

  getResumoCategoriaCartao(anoMes: string): Observable<ResumoCategoria[]> {
    return this.http.get<ResumoCategoria[]>(`/financas/${anoMes}/transacoes-cartao/resumo-categoria`);
  }

  atualizarCategoriaTransacaoCartao(id: string, categoria: string | null): Observable<TransacaoCartao> {
    return this.http.put<TransacaoCartao>(`/financas/transacoes-cartao/${id}`, { categoria });
  }

  removerTransacaoCartao(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/financas/transacoes-cartao/${id}`);
  }

  marcarNaoReconhecida(id: string): Observable<TransacaoCartao> {
    return this.http.post<TransacaoCartao>(`/financas/transacoes-cartao/${id}/nao-reconhecida`, {});
  }

  desmarcarNaoReconhecida(id: string): Observable<TransacaoCartao> {
    return this.http.delete<TransacaoCartao>(`/financas/transacoes-cartao/${id}/nao-reconhecida`);
  }

  recalcularPrevisoesParcelas(): Observable<{ criadas: number }> {
    return this.http.post<{ criadas: number }>('/financas/transacoes-cartao/recalcular-previsoes', {});
  }
}
