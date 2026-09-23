import { Component, OnInit } from '@angular/core';
import { MarketDataService } from '../../../services/market-data.service';
import { MedianaGrupo } from '../../../interfaces/market-data.interfaces';

type TipoGrupo = 'setor' | 'segmento';
type CampoIndicador = keyof Omit<MedianaGrupo, 'tipoGrupo' | 'nomeGrupo' | 'anoMes'>;

interface ColunaIndicador {
  campo: CampoIndicador;
  label: string;
  percentual: boolean;
  cor: string;
}

interface PontoSerie {
  x: number;
  y: number;
  valor: number;
  anoMes: string;
}

const INDICADORES_DEFAULT: CampoIndicador[] = ['roe', 'dy', 'pl', 'pvp'];

@Component({
  selector: 'app-medianas',
  templateUrl: './medianas.component.html',
  styleUrls: ['./medianas.component.scss'],
})
export class MedianasComponent implements OnInit {
  tipoGrupo: TipoGrupo = 'setor';
  meses: string[] = [];
  anoMesSelecionado = '';

  medianas: MedianaGrupo[] = [];

  carregandoMeses = false;
  carregandoMedianas = false;

  readonly colunas: ColunaIndicador[] = [
    { campo: 'pl', label: 'P/L', percentual: false, cor: '#1A3C56' },
    { campo: 'pvp', label: 'P/VP', percentual: false, cor: '#2F6690' },
    { campo: 'pEbit', label: 'P/EBIT', percentual: false, cor: '#3A7CA5' },
    { campo: 'roe', label: 'ROE', percentual: true, cor: '#16A34A' },
    { campo: 'roic', label: 'ROIC', percentual: true, cor: '#4ADE80' },
    { campo: 'roa', label: 'ROA', percentual: true, cor: '#84CC16' },
    { campo: 'margemBruta', label: 'Mg.Bruta', percentual: true, cor: '#CA8A04' },
    { campo: 'margemEbit', label: 'Mg.EBIT', percentual: true, cor: '#D97706' },
    { campo: 'margemLiquida', label: 'Mg.Líq.', percentual: true, cor: '#EA580C' },
    { campo: 'dy', label: 'DY', percentual: true, cor: '#DC2626' },
    { campo: 'dividaLiquidaPatrimonio', label: 'DL/PL', percentual: false, cor: '#7C3AED' },
    { campo: 'dividaLiquidaEbitda', label: 'DL/EBITDA', percentual: false, cor: '#A855F7' },
    { campo: 'cagrReceita5a', label: 'CAGR Rec 5a', percentual: true, cor: '#0891B2' },
    { campo: 'cagrLucro5a', label: 'CAGR Luc 5a', percentual: true, cor: '#0D9488' },
  ];

  // ── Gráfico histórico ─────────────────────────────────────────────────────
  gruposHistorico: string[] = [];
  grupoHistoricoSelecionado = '';
  historico: MedianaGrupo[] = [];
  carregandoGrupos = false;
  carregandoHistorico = false;

  indicadoresSelecionados = new Set<CampoIndicador>(INDICADORES_DEFAULT);

  readonly chartWidth = 640;
  readonly chartHeight = 220;
  private readonly padding = { top: 16, right: 16, bottom: 26, left: 8 };

  constructor(private marketData: MarketDataService) {}

  ngOnInit(): void {
    this.carregarMeses();
  }

  carregarMeses(): void {
    this.carregandoMeses = true;
    this.marketData.getMeses().subscribe({
      next: (meses) => {
        this.meses = meses;
        if (meses.length) {
          this.anoMesSelecionado = meses[0];
          this.carregarMedianas();
          this.carregarGruposHistorico();
        }
        this.carregandoMeses = false;
      },
      error: () => { this.carregandoMeses = false; },
    });
  }

  carregarMedianas(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoMedianas = true;
    this.marketData.getMedianas(this.tipoGrupo, this.anoMesSelecionado).subscribe({
      next: (medianas) => {
        this.medianas = medianas;
        this.carregandoMedianas = false;
      },
      error: () => { this.carregandoMedianas = false; },
    });
  }

  /** Lista de grupos pro seletor do gráfico — sempre a partir do mês mais recente disponível. */
  carregarGruposHistorico(): void {
    if (!this.meses.length) return;
    this.carregandoGrupos = true;
    this.marketData.getGrupos(this.tipoGrupo, this.meses[0]).subscribe({
      next: (grupos) => {
        this.gruposHistorico = grupos;
        this.grupoHistoricoSelecionado = grupos[0] ?? '';
        this.carregandoGrupos = false;
        this.carregarHistorico();
      },
      error: () => { this.carregandoGrupos = false; },
    });
  }

  carregarHistorico(): void {
    if (!this.grupoHistoricoSelecionado) { this.historico = []; return; }
    this.carregandoHistorico = true;
    this.marketData.getMedianasHistorico(this.tipoGrupo, this.grupoHistoricoSelecionado).subscribe({
      next: (historico) => {
        this.historico = historico;
        this.carregandoHistorico = false;
      },
      error: () => { this.carregandoHistorico = false; },
    });
  }

  onTipoGrupoChange(): void {
    this.carregarMedianas();
    this.carregarGruposHistorico();
  }

  onMesChange(): void {
    this.carregarMedianas();
  }

  onGrupoHistoricoChange(): void {
    this.carregarHistorico();
  }

  toggleIndicador(campo: CampoIndicador): void {
    if (this.indicadoresSelecionados.has(campo)) {
      this.indicadoresSelecionados.delete(campo);
    } else {
      this.indicadoresSelecionados.add(campo);
    }
  }

  isIndicadorSelecionado(campo: CampoIndicador): boolean {
    return this.indicadoresSelecionados.has(campo);
  }

  get colunasAtivas(): ColunaIndicador[] {
    return this.colunas.filter((c) => this.indicadoresSelecionados.has(c.campo));
  }

  getValor(mediana: MedianaGrupo, campo: keyof MedianaGrupo): number | null {
    const v = mediana[campo];
    return typeof v === 'number' ? v : null;
  }

  formatValor(v: number | null, percentual: boolean): string {
    if (v === null) return '—';
    return percentual ? `${v.toFixed(1)}%` : v.toFixed(2);
  }

  formatMes(anoMes: string): string {
    if (!anoMes) return '';
    const [ano, mes] = anoMes.split('-');
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[+mes]}/${ano}`;
  }

  get carregando(): boolean {
    return this.carregandoMeses || this.carregandoMedianas;
  }

  // ── Geometria do gráfico ───────────────────────────────────────────────────
  // Cada série é normalizada no seu próprio min/max (não no valor absoluto) — indicadores
  // como P/L e DY têm escalas muito diferentes; comparar a *forma* da evolução no mesmo
  // eixo só funciona se cada linha ocupar toda a altura disponível.

  private valoresValidos(campo: CampoIndicador): number[] {
    return this.historico
      .map((h) => h[campo])
      .filter((v): v is number => typeof v === 'number');
  }

  pontosSerie(campo: CampoIndicador): PontoSerie[] {
    const n = this.historico.length;
    if (n === 0) return [];

    const valores = this.valoresValidos(campo);
    const min = valores.length ? Math.min(...valores) : 0;
    const max = valores.length ? Math.max(...valores) : 0;
    const amplitude = max - min;

    const larguraUtil = this.chartWidth - this.padding.left - this.padding.right;
    const alturaUtil = this.chartHeight - this.padding.top - this.padding.bottom;

    const pontos: PontoSerie[] = [];
    this.historico.forEach((h, i) => {
      const valor = h[campo];
      if (typeof valor !== 'number') return;

      const x = n === 1
        ? this.padding.left + larguraUtil / 2
        : this.padding.left + (larguraUtil * i) / (n - 1);

      // amplitude 0 (série constante ou 1 ponto só) → centraliza a linha.
      const frac = amplitude === 0 ? 0.5 : (valor - min) / amplitude;
      const y = this.padding.top + alturaUtil * (1 - frac);

      pontos.push({ x, y, valor, anoMes: h.anoMes });
    });

    return pontos;
  }

  pathSerie(campo: CampoIndicador): string {
    const pontos = this.pontosSerie(campo);
    if (!pontos.length) return '';
    // Pula gaps (indicador ausente num mês) em vez de interpolar — abre um novo segmento "M".
    return pontos
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  }

  ultimoValor(campo: CampoIndicador): number | null {
    for (let i = this.historico.length - 1; i >= 0; i--) {
      const v = this.historico[i][campo];
      if (typeof v === 'number') return v;
    }
    return null;
  }

  /** Rótulos do eixo X — no máximo ~8 pra não empilhar texto quando há muitos meses. */
  get labelsEixoX(): { x: number; texto: string }[] {
    const n = this.historico.length;
    if (n === 0) return [];
    const larguraUtil = this.chartWidth - this.padding.left - this.padding.right;
    const passo = Math.max(1, Math.ceil(n / 8));

    return this.historico
      .map((h, i) => ({ i, h }))
      .filter(({ i }) => i % passo === 0 || i === n - 1)
      .map(({ i, h }) => ({
        x: n === 1 ? this.padding.left + larguraUtil / 2 : this.padding.left + (larguraUtil * i) / (n - 1),
        texto: this.formatMes(h.anoMes),
      }));
  }
}
