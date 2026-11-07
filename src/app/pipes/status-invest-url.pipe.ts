import { Pipe, PipeTransform } from '@angular/core';

// Uso no template: [href]="inv.ticker | statusInvestUrl:inv.tipo"
// FII fica em /fundos-imobiliarios/ — /acoes/HGLG11 dá 404 no Status Invest (confirmado em
// 2026-11-06). O tipo vem do contexto da linha, não do sufixo do ticker: unit de ação também
// termina em 11 (ex: TAEE11) e é /acoes/.
@Pipe({ name: 'statusInvestUrl', standalone: true })
export class StatusInvestUrlPipe implements PipeTransform {
  transform(ticker: string | null | undefined, tipo: string = 'acao'): string | null {
    if (!ticker) return null;
    const categoria = tipo === 'fii' ? 'fundos-imobiliarios' : 'acoes';
    return `https://statusinvest.com.br/${categoria}/${encodeURIComponent(ticker)}`;
  }
}
