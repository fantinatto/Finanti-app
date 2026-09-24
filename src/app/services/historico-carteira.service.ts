import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoCarteira } from '../interfaces/portfolio.interfaces';
import { HistoricoCarteira } from '../interfaces/simulacao.interfaces';

@Injectable({ providedIn: 'root' })
export class HistoricoCarteiraService {
  constructor(private http: HttpClient) {}

  listar(carteira: TipoCarteira): Observable<HistoricoCarteira[]> {
    return this.http.get<HistoricoCarteira[]>('/portfolio/historico', { params: { carteira } });
  }
}
