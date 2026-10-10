import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MarketDataService } from '../../../services/market-data.service';
import { FiltroAvancadoMeta, FiltroFixoMeta, IndicadorBruto, IndicadorFiiBruto, IngestionFiltro, ResumoColeta, ResumoColetaFii } from '../../../interfaces/market-data.interfaces';

interface ColunaIndicador {
  campo: keyof IndicadorBruto;
  label: string;
  descricao: string;
  fonte: 'brapi' | 'bolsai' | 'calculado';
}

interface ColunaIndicadorFii {
  campo: keyof IndicadorFiiBruto;
  label: string;
  descricao: string;
}

const LABEL_GRUPO_FILTRO: Record<FiltroAvancadoMeta['grupo'], string> = {
  valuation: 'Valuation',
  rentabilidade: 'Rentabilidade',
  endividamento: 'Endividamento',
  crescimento: 'Crescimento',
  outros: 'Outros',
};

interface GrupoFiltroAvancado {
  grupo: FiltroAvancadoMeta['grupo'];
  label: string;
  campos: FiltroAvancadoMeta[];
}

/** Modelo dos inputs — null enquanto o campo não é preenchido (não entra no payload). */
type RangeInput = { min: number | null; max: number | null };

/**
 * Defaults de segurança pro próprio usuário — não é o hard filter do motor de score (que
 * já provou nesta sessão que threshold estático sobre indicador isolado bane empresa saudável
 * em baixa de ciclo, ex: CSNA3/USIM5 com ROE<0 temporário). Isso aqui é diferente: um pré-filtro
 * OPCIONAL na coleta, que o usuário decide manter, afrouxar ou zerar antes de cada ingestão —
 * evita coletar (e depois considerar comprar) empresa em situação financeira ruim no momento,
 * sem travar nada no motor de scoring pros outros usos do ranking.
 */
const FILTROS_PADRAO_SEGURANCA: Record<string, RangeInput> = {
  dy: { min: 1, max: null },
  roe: { min: 1, max: null },
  margemliquida: { min: 1, max: null },
};

@Component({
  selector: 'app-coleta',
  templateUrl: './coleta.component.html',
  styleUrls: ['./coleta.component.scss'],
})
export class ColetaComponent implements OnInit {
  /** Segrega Coleta de ações e de FII — pipelines/endpoints/tabelas 100% separados no backend
   * (ver IngestionFiiService), então aqui também fica tudo em estado próprio, nada compartilhado
   * com o fluxo de ações além do layout. */
  abaColeta: 'acoes' | 'fii' = 'acoes';

  meses: string[] = [];
  anoMesSelecionado = '';

  resumo: ResumoColeta | null = null;
  indicadores: IndicadorBruto[] = [];

  ingerindo = false;
  carregando = false;
  sidebarAberta = false;

  mesesFii: string[] = [];
  anoMesSelecionadoFii = '';
  resumoFii: ResumoColetaFii | null = null;
  indicadoresFii: IndicadorFiiBruto[] = [];
  ingerindoFii = false;
  carregandoFii = false;

  filtroIngestion: IngestionFiltro = {
    soAcoes: false,
    excluirFiis: false,
    excluirBdrs: false,
    setor: '',
    marketCapMin: null,
  };

  filtrosAvancadosDisponiveis: FiltroAvancadoMeta[] = [];
  rangesInput: Record<string, RangeInput> = {};
  filtrosFixos: FiltroFixoMeta[] = [];


  readonly colunas: ColunaIndicador[] = [
    { campo: 'pl',                      label: 'P/L',           descricao: 'Preço / Lucro',                    fonte: 'bolsai' },
    { campo: 'pvp',                     label: 'P/VP',          descricao: 'Preço / Valor Patrimonial',        fonte: 'bolsai' },
    { campo: 'dy',                      label: 'DY',            descricao: 'Dividend Yield (%)',               fonte: 'brapi' },
    { campo: 'roe',                     label: 'ROE',           descricao: 'Retorno sobre PL (%)',             fonte: 'bolsai' },
    { campo: 'roa',                     label: 'ROA',           descricao: 'Retorno sobre Ativos (%)',         fonte: 'bolsai' },
    { campo: 'roic',                    label: 'ROIC',          descricao: 'Retorno sobre Capital Investido',  fonte: 'bolsai' },
    { campo: 'margemBruta',             label: 'Mg.Bruta',      descricao: 'Margem Bruta (%)',                 fonte: 'bolsai' },
    { campo: 'margemEbit',              label: 'Mg.EBIT',       descricao: 'Margem EBIT / Operacional (%)',    fonte: 'bolsai' },
    { campo: 'margemLiquida',           label: 'Mg.Líq.',       descricao: 'Margem Líquida (%)',               fonte: 'bolsai' },
    { campo: 'lpa',                     label: 'LPA',           descricao: 'Lucro por Ação',                   fonte: 'bolsai' },
    { campo: 'vpa',                     label: 'VPA',           descricao: 'Valor Patrimonial por Ação',       fonte: 'bolsai' },
    { campo: 'dividaLiquidaPatrimonio', label: 'DL/PL',         descricao: 'Dívida Líquida / Patrimônio',      fonte: 'bolsai' },
    { campo: 'pEbit',                   label: 'P/EBIT',        descricao: 'Preço / EBIT',                     fonte: 'bolsai' },
    { campo: 'dividaLiquidaEbitda',     label: 'DL/EBITDA',     descricao: 'Dívida Líquida / EBITDA',          fonte: 'bolsai' },
    { campo: 'cagrReceita5a',           label: 'CAGR Rec 5a',   descricao: 'CAGR Receita 5 anos (%)',          fonte: 'bolsai' },
    { campo: 'cagrLucro5a',             label: 'CAGR Luc 5a',   descricao: 'CAGR Lucro 5 anos (%)',            fonte: 'bolsai' },
  ];

  readonly colunasFii: ColunaIndicadorFii[] = [
    { campo: 'dy',                   label: 'DY',            descricao: 'Dividend Yield (%, 12 meses)' },
    { campo: 'pvp',                  label: 'P/VP',          descricao: 'Preço / Valor Patrimonial da cota' },
    { campo: 'valorPatrimonialCota', label: 'VP/Cota',       descricao: 'Valor patrimonial por cota' },
    { campo: 'liquidezMediaDiaria',  label: 'Liquidez/dia',  descricao: 'Liquidez média diária (R$)' },
    { campo: 'percentualCaixa',      label: '% Caixa',       descricao: 'Percentual do patrimônio em caixa' },
    { campo: 'dividendCagr',         label: 'CAGR Div.',     descricao: 'Crescimento anualizado do dividendo' },
    { campo: 'cotaCagr',             label: 'CAGR Cota',     descricao: 'Crescimento anualizado do valor da cota' },
    { campo: 'numeroCotistas',       label: 'Cotistas',      descricao: 'Número de cotistas' },
    { campo: 'patrimonio',           label: 'Patrimônio',    descricao: 'Patrimônio líquido do fundo (R$)' },
    { campo: 'lastDividend',         label: 'Últ. Dividendo', descricao: 'Último dividendo pago por cota' },
  ];

  constructor(
    private marketData: MarketDataService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.marketData.getMeses().subscribe({
      next: (meses) => {
        this.meses = meses;
        if (meses.length) {
          this.anoMesSelecionado = meses[0];
          this.carregarDados();
        }
      },
    });

    this.marketData.getFiltrosAvancados().subscribe({
      next: (campos) => {
        this.filtrosAvancadosDisponiveis = campos;
        this.rangesInput = Object.fromEntries(
          campos.map((c) => {
            const padrao = FILTROS_PADRAO_SEGURANCA[c.campo];
            // Cópia nova sempre — reusar o objeto padrão por referência faria o ngModel do
            // input mutar a constante compartilhada ao digitar, corrompendo o default pro
            // resto da sessão do browser.
            return [c.campo, padrao ? { ...padrao } : ({ min: null, max: null } as RangeInput)];
          }),
        );
        this.filtrosAvancadosPorGrupo = this.agruparFiltrosAvancados(campos);
      },
    });

    this.marketData.getFiltrosFixos().subscribe({
      next: (fixos) => { this.filtrosFixos = fixos; },
    });

    this.marketData.getMesesFii().subscribe({
      next: (meses) => {
        this.mesesFii = meses;
        if (meses.length) {
          this.anoMesSelecionadoFii = meses[0];
          this.carregarDadosFii();
        }
      },
    });
  }

  carregarDadosFii(): void {
    if (!this.anoMesSelecionadoFii) return;
    this.carregandoFii = true;

    this.marketData.getResumoFii(this.anoMesSelecionadoFii).subscribe({
      next: (r) => { this.resumoFii = r; },
    });

    this.marketData.getIndicadoresFii(this.anoMesSelecionadoFii).subscribe({
      next: (dados) => {
        this.indicadoresFii = dados;
        this.carregandoFii = false;
      },
      error: () => { this.carregandoFii = false; },
    });
  }

  dispararIngestionFii(): void {
    if (this.ingerindoFii) return;
    this.ingerindoFii = true;
    this.marketData.dispararIngestionFii().subscribe({
      next: (res) => {
        this.toastr.success(`${res.processadas} FIIs processados`, 'Coleta concluída');
        this.ingerindoFii = false;
        this.marketData.getMesesFii().subscribe((meses) => {
          this.mesesFii = meses;
          if (meses.length) {
            this.anoMesSelecionadoFii = meses[0];
            this.carregarDadosFii();
          }
        });
      },
      error: () => {
        this.toastr.error('Falha na coleta de FIIs', 'Erro');
        this.ingerindoFii = false;
      },
    });
  }

  getValorFii(item: IndicadorFiiBruto, campo: keyof IndicadorFiiBruto): number | null {
    const v = item[campo];
    return typeof v === 'number' ? v : null;
  }

  formatValorFii(v: number | null, campo: string): string {
    if (v === null) return '—';
    if (['dy', 'percentualCaixa', 'dividendCagr', 'cotaCagr'].includes(campo)) {
      return v.toFixed(2) + '%';
    }
    if (['patrimonio', 'liquidezMediaDiaria'].includes(campo)) {
      return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    }
    if (['numeroCotistas', 'numeroCotas'].includes(campo)) {
      return v.toLocaleString('pt-BR');
    }
    return v.toFixed(2);
  }

  /**
   * Calculado uma vez quando os filtros chegam da API, não um getter — um getter recriaria
   * Map/objetos novos a cada change detection, e com [(ngModel)] nos inputs isso rodava a
   * cada tecla digitada: o *ngFor via array/objetos "novos" toda hora e recriava os 26
   * grupos x 2 inputs inteiros, travando a tela ao digitar.
   */
  filtrosAvancadosPorGrupo: GrupoFiltroAvancado[] = [];

  private agruparFiltrosAvancados(campos: FiltroAvancadoMeta[]): GrupoFiltroAvancado[] {
    const porGrupo = new Map<FiltroAvancadoMeta['grupo'], FiltroAvancadoMeta[]>();
    for (const campo of campos) {
      if (!porGrupo.has(campo.grupo)) porGrupo.set(campo.grupo, []);
      porGrupo.get(campo.grupo)!.push(campo);
    }
    return Array.from(porGrupo.entries()).map(([grupo, campos]) => ({
      grupo,
      label: LABEL_GRUPO_FILTRO[grupo],
      campos,
    }));
  }

  trackByGrupo(_index: number, grupo: GrupoFiltroAvancado): string {
    return grupo.grupo;
  }

  trackByCampo(_index: number, campo: FiltroAvancadoMeta): string {
    return campo.campo;
  }

  get qtdFiltrosAvancadosAtivos(): number {
    return Object.values(this.rangesInput).filter((r) => r.min != null || r.max != null).length;
  }

  limparFiltrosAvancados(): void {
    for (const campo of Object.keys(this.rangesInput)) {
      this.rangesInput[campo] = { min: null, max: null };
    }
  }

  carregarDados(): void {
    if (!this.anoMesSelecionado) return;
    this.carregando = true;

    this.marketData.getResumo(this.anoMesSelecionado).subscribe({
      next: (r) => { this.resumo = r; },
    });

    this.marketData.getIndicadores(this.anoMesSelecionado).subscribe({
      next: (dados) => {
        this.indicadores = dados;
        this.carregando = false;
      },
      error: () => { this.carregando = false; },
    });
  }

  private montarFiltrosAvancados(): Record<string, { min?: number; max?: number }> {
    const resultado: Record<string, { min?: number; max?: number }> = {};
    for (const [campo, range] of Object.entries(this.rangesInput)) {
      if (range.min == null && range.max == null) continue;
      resultado[campo] = {
        ...(range.min != null ? { min: range.min } : {}),
        ...(range.max != null ? { max: range.max } : {}),
      };
    }
    return resultado;
  }

  dispararIngestion(): void {
    if (this.ingerindo) return;
    this.ingerindo = true;
    const filtro: IngestionFiltro = { ...this.filtroIngestion, filtrosAvancados: this.montarFiltrosAvancados() };
    this.marketData.dispararIngestion(filtro).subscribe({
      next: (res) => {
        this.toastr.success(`${res.processadas} ações processadas`, 'Coleta concluída');
        this.ingerindo = false;
        this.marketData.getMeses().subscribe(meses => {
          this.meses = meses;
          if (meses.length) {
            this.anoMesSelecionado = meses[0];
            this.carregarDados();
          }
        });
      },
      error: () => {
        this.toastr.error('Falha na coleta', 'Erro');
        this.ingerindo = false;
      },
    });
  }

  getValor(item: IndicadorBruto, campo: keyof IndicadorBruto): number | null {
    const v = item[campo];
    return typeof v === 'number' ? v : null;
  }

  formatValor(v: number | null, campo: string): string {
    if (v === null) return '—';
    if (['roe','roa','roic','margemBruta','margemEbit','margemLiquida','dy','cagrReceita5a','cagrLucro5a'].includes(campo)) {
      return v.toFixed(1) + '%';
    }
    return v.toFixed(2);
  }

  classeValor(v: number | null): string {
    return v === null ? 'val--null' : 'val--ok';
  }

  classeColuna(fonte: string): string {
    return fonte === 'bolsai' ? 'col--bolsai' : '';
  }

  formatMes(anoMes: string): string {
    if (!anoMes) return '';
    const [ano, mes] = anoMes.split('-');
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[+mes]}/${ano}`;
  }

}
