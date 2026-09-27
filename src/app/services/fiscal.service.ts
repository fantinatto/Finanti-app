import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApuracaoAnual, OperacaoFiscal, UpsertOperacaoFiscalPayload } from '../interfaces/fiscal.interfaces';

@Injectable({ providedIn: 'root' })
export class FiscalService {
  constructor(private http: HttpClient) {}

  listarOperacoes(ano?: number): Observable<OperacaoFiscal[]> {
    return this.http.get<OperacaoFiscal[]>('/fiscal/operacoes', { params: ano ? { ano } : {} });
  }

  criarOperacao(payload: UpsertOperacaoFiscalPayload): Observable<OperacaoFiscal> {
    return this.http.post<OperacaoFiscal>('/fiscal/operacoes', payload);
  }

  atualizarOperacao(id: string, payload: UpsertOperacaoFiscalPayload): Observable<OperacaoFiscal> {
    return this.http.put<OperacaoFiscal>(`/fiscal/operacoes/${id}`, payload);
  }

  removerOperacao(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/fiscal/operacoes/${id}`);
  }

  getApuracaoAnual(ano: number): Observable<ApuracaoAnual> {
    return this.http.get<ApuracaoAnual>('/fiscal/apuracao', { params: { ano } });
  }
}
