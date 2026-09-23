import { Component, Input, OnChanges } from '@angular/core';
import { Citacao, ContextoInvestimento, DICIONARIO_CITACOES } from './citacoes.model';

@Component({
  selector: 'app-quote-banner',
  templateUrl: './quote-banner.component.html',
  styleUrls: ['./quote-banner.component.scss'],
})
export class QuoteBannerComponent implements OnChanges {
  @Input() contexto: ContextoInvestimento = 'GERAL_CARTEIRA';

  citacaoAtiva: Citacao | null = null;

  ngOnChanges(): void {
    const lista = DICIONARIO_CITACOES[this.contexto] ?? DICIONARIO_CITACOES.GERAL_CARTEIRA;
    const index = Math.floor(Math.random() * lista.length);
    this.citacaoAtiva = lista[index] ?? null;
  }
}
