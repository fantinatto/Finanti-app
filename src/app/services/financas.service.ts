import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GanhoMensal, GastoMensal, MesFinanceiro, UpsertGanhoPayload, UpsertGastoPayload } from '../interfaces/financas.interfaces';

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
}
