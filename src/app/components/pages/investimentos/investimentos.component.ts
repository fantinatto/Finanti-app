import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PortfolioService } from '../../../services/portfolio.service';
import { MarketDataService } from '../../../services/market-data.service';
import { HistoricoCarteiraService } from '../../../services/historico-carteira.service';
import { TipoCarteira } from '../../../interfaces/portfolio.interfaces';
import { CarteiraApi, CarteiraBaseComponent } from './carteira-base.component';

@Component({
  selector: 'app-investimentos',
  templateUrl: './investimentos.component.html',
  styleUrls: ['./investimentos.component.scss'],
})
export class InvestimentosComponent extends CarteiraBaseComponent {
  readonly carteira: TipoCarteira = 'real';
  protected readonly api: CarteiraApi;

  constructor(
    portfolioService: PortfolioService,
    marketData: MarketDataService,
    historicoCarteira: HistoricoCarteiraService,
    toastr: ToastrService,
  ) {
    super(marketData, historicoCarteira, toastr);
    this.api = portfolioService;
  }
}
