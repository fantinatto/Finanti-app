import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FiltroAvancadoMeta,
  FiltroFixoMeta,
  HistoricoRankingItem,
  IndicadorBruto,
  IngestionFiltro,
  MedianaGrupo,
  RankingItem,
  ResumoColeta,
  Top3PorGrupo,
} from '../interfaces/market-data.interfaces';

@Injectable({ providedIn: 'root' })
export class MarketDataService {
  constructor(private http: HttpClient) {}

  getMeses(): Observable<string[]> {
    return this.http.get<string[]>('/market-data/meses');
  }

  getGrupos(tipoGrupo: string, anoMes: string): Observable<string[]> {
    return this.http.get<string[]>('/market-data/grupos', {
      params: { tipoGrupo, anoMes },
    });
  }

  getRanking(tipoGrupo: string, nomeGrupo: string, anoMes: string): Observable<RankingItem[]> {
    return this.http.get<RankingItem[]>('/market-data/ranking', {
      params: { tipoGrupo, nomeGrupo, anoMes },
    });
  }

  /** Score Ponderado: Setor 60% + Segmento 30% + Geral 10% (ver ranking-query.service.ts). */
  getRankingHibrido(anoMes: string): Observable<RankingItem[]> {
    return this.http.get<RankingItem[]>('/market-data/ranking-hibrido', { params: { anoMes } });
  }

  dispararIngestion(filtro: IngestionFiltro = {}): Observable<{ processadas: number; erros: number }> {
    return this.http.post<{ processadas: number; erros: number }>('/market-data/ingest', filtro);
  }

  getIndicadores(anoMes: string): Observable<IndicadorBruto[]> {
    return this.http.get<IndicadorBruto[]>('/market-data/indicadores', { params: { anoMes } });
  }

  getResumo(anoMes: string): Observable<ResumoColeta> {
    return this.http.get<ResumoColeta>('/market-data/resumo', { params: { anoMes } });
  }

  previewTicker(ticker: string): Observable<unknown> {
    return this.http.get<unknown>(`/market-data/preview/${ticker}`);
  }

  getMedianas(tipoGrupo: string, anoMes: string): Observable<MedianaGrupo[]> {
    return this.http.get<MedianaGrupo[]>('/market-data/medianas', {
      params: { tipoGrupo, anoMes },
    });
  }

  getMedianasHistorico(tipoGrupo: string, nomeGrupo: string): Observable<MedianaGrupo[]> {
    return this.http.get<MedianaGrupo[]>('/market-data/medianas-historico', {
      params: { tipoGrupo, nomeGrupo },
    });
  }

  getTop3(tipoGrupo: string, anoMes: string): Observable<Top3PorGrupo> {
    return this.http.get<Top3PorGrupo>('/market-data/top3', {
      params: { tipoGrupo, anoMes },
    });
  }

  getHistoricoRanking(tipoGrupo: string): Observable<HistoricoRankingItem[]> {
    return this.http.get<HistoricoRankingItem[]>('/market-data/historico-ranking', {
      params: { tipoGrupo },
    });
  }

  getSetoresPorSegmento(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>('/market-data/setores-por-segmento');
  }

  getFiltrosAvancados(): Observable<FiltroAvancadoMeta[]> {
    return this.http.get<FiltroAvancadoMeta[]>('/market-data/filtros-avancados');
  }

  getFiltrosFixos(): Observable<FiltroFixoMeta[]> {
    return this.http.get<FiltroFixoMeta[]>('/market-data/filtros-fixos');
  }
}
