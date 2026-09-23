import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { MarketDataService } from '../../../services/market-data.service';
import { HistoricoRankingItem, Top3Item, Top3PorGrupo } from '../../../interfaces/market-data.interfaces';

type TipoGrupo = 'setor' | 'segmento';

interface GrupoResumo {
  nomeGrupo: string;
  top3: Top3Item[];
}

interface SetorComSegmentos {
  nomeSetor: string;
  segmentos: GrupoResumo[];
}

type Eixo = 'qualidade' | 'risco' | 'preco';

interface SegmentoBarra {
  eixo: Eixo;
  label: string;
  cor: string;
  percentual: number; // % da LARGURA da barra (composição interna), não da tela
  valorMedio: number | null;
}

interface BarraGrafico {
  nomeGrupo: string;
  mediaTop3: number;
  percentual: number; // largura da barra em relação ao maior grupo do gráfico
  segmentos: SegmentoBarra[];
}

/** Igual a SCORE_WEIGHTS em indicator.config.ts (Finanti-api) — mantenha os dois em sincronia. */
const PESOS_EIXO: Record<Eixo, number> = { qualidade: 0.40, risco: 0.30, preco: 0.30 };
const LABEL_EIXO: Record<Eixo, string> = { qualidade: 'Qualidade', risco: 'Risco', preco: 'Preço' };
// 3 primeiros slots do tema categórico padrão (já validados pairwise em references/palette.md do skill de dataviz).
const COR_EIXO: Record<Eixo, string> = { qualidade: '#2a78d6', risco: '#eb6834', preco: '#1baf7a' };

type TipoHistorico = 'setor' | 'segmento';

/**
 * Tema categórico padrão de 8 slots (skill dataviz, references/palette.md) — validado pro
 * pairlist "adjacente" (stacks/bars/lines), que é o caso de uso aqui: pior par adjacente
 * CVD ΔE 9.1 (light), pior par normal-vision ΔE 19.6. 3 tons (aqua/amarelo/magenta) ficam
 * abaixo de 3:1 de contraste — por isso a legenda (sempre visível) e a tabela cobrem a
 * regra de "relief" em vez de depender só da cor pra identificar a série.
 */
const PALETA_CATEGORICA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
/** Quantos grupos (setores/segmentos) entram no gráfico de histórico — cap no tamanho da paleta validada. */
const TOP_N_HISTORICO = PALETA_CATEGORICA.length;

interface PontoLinha {
  anoMes: string;
  x: number;
  y: number;
  valor: number;
}

interface SerieLinha {
  nomeGrupo: string;
  cor: string;
  pontos: PontoLinha[];
  pathD: string;
}

interface EixoTick {
  anoMes?: string;
  x?: number;
  y?: number;
  label: string;
}

interface GraficoHistorico {
  series: SerieLinha[];
  eixoX: EixoTick[];
  eixoY: EixoTick[];
  largura: number;
  altura: number;
}

@Component({
  selector: 'app-resumo',
  templateUrl: './resumo.component.html',
  styleUrls: ['./resumo.component.scss'],
})
export class ResumoComponent implements OnInit {
  tipoGrupo: TipoGrupo = 'setor';
  meses: string[] = [];
  anoMesSelecionado = '';

  grupos: GrupoResumo[] = [];
  mapaSetorSegmento: Record<string, string> = {};

  /** Calculado uma vez quando a resposta chega (não getter) — evita recriar o SVG a cada
   * change detection, mesma lição do travamento em /coleta (ver investimentos.component.ts). */
  graficoSetor: GraficoHistorico | null = null;
  graficoSegmento: GraficoHistorico | null = null;
  // Chave indexada como string (não TipoHistorico) porque vem do contexto de um ng-template
  // reutilizável (*ngTemplateOutlet) — o Angular tipa esses contextos como `any`, e indexar
  // um Record com union type usando uma chave `any` é erro de template em modo strict.
  tabelaVisivel: Record<string, boolean> = { setor: false, segmento: false };
  hover: { chave: TipoHistorico; serie: SerieLinha; ponto: PontoLinha } | null = null;

  carregandoMeses = false;
  carregandoResumo = false;
  carregandoHistorico = false;

  constructor(private marketData: MarketDataService) {}

  ngOnInit(): void {
    this.carregarMeses();
    this.carregarHistoricos();
  }

  carregarHistoricos(): void {
    this.carregandoHistorico = true;
    forkJoin({
      setor: this.marketData.getHistoricoRanking('setor'),
      segmento: this.marketData.getHistoricoRanking('segmento'),
    }).subscribe({
      next: ({ setor, segmento }) => {
        this.graficoSetor = this.construirGraficoHistorico(setor);
        this.graficoSegmento = this.construirGraficoHistorico(segmento);
        this.carregandoHistorico = false;
      },
      error: () => { this.carregandoHistorico = false; },
    });
  }

  carregarMeses(): void {
    this.carregandoMeses = true;
    this.marketData.getMeses().subscribe({
      next: (meses) => {
        this.meses = meses;
        if (meses.length) {
          this.anoMesSelecionado = meses[0];
          this.carregarResumo();
        }
        this.carregandoMeses = false;
      },
      error: () => { this.carregandoMeses = false; },
    });
  }

  carregarResumo(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoResumo = true;
    this.grupos = [];

    forkJoin({
      nomesGrupos: this.marketData.getGrupos(this.tipoGrupo, this.anoMesSelecionado),
      top3: this.marketData.getTop3(this.tipoGrupo, this.anoMesSelecionado),
      mapaSetorSegmento: this.tipoGrupo === 'segmento'
        ? this.marketData.getSetoresPorSegmento()
        : of<Record<string, string>>({}),
    }).subscribe({
      next: ({ nomesGrupos, top3, mapaSetorSegmento }) => {
        this.grupos = nomesGrupos.map((nomeGrupo) => ({
          nomeGrupo,
          top3: (top3 as Top3PorGrupo)[nomeGrupo] ?? [],
        }));
        this.mapaSetorSegmento = mapaSetorSegmento;
        this.carregandoResumo = false;
      },
      error: () => { this.carregandoResumo = false; },
    });
  }

  /** Agrupa os segmentos sob seu setor (1 setor : N segmentos) — só faz sentido quando tipoGrupo === 'segmento'. */
  get gruposPorSetor(): SetorComSegmentos[] {
    const porSetor: Record<string, GrupoResumo[]> = {};

    for (const g of this.grupos) {
      const nomeSetor = this.mapaSetorSegmento[g.nomeGrupo] ?? 'Sem setor';
      if (!porSetor[nomeSetor]) porSetor[nomeSetor] = [];
      porSetor[nomeSetor].push(g);
    }

    return Object.keys(porSetor)
      .sort((a, b) => a.localeCompare(b))
      .map((nomeSetor) => ({
        nomeSetor,
        segmentos: [...porSetor[nomeSetor]].sort((a, b) => a.nomeGrupo.localeCompare(b.nomeGrupo)),
      }));
  }

  onTipoGrupoChange(): void {
    this.carregarResumo();
  }

  onMesChange(): void {
    this.carregarResumo();
  }

  /**
   * Compara os grupos pela média de scoreFinal do top 3 — um valor só por grupo,
   * então o gráfico é a comparação do mês atual. Uma evolução histórica (linha por
   * mês) fica pra quando tivermos mais de um anoMes com dado consistente; por ora
   * isso já dá o "comparativo entre setores" pedido sem inventar dado que não existe.
   */
  get graficoDados(): BarraGrafico[] {
    const comComposicao = this.grupos
      .map((g) => ({ nomeGrupo: g.nomeGrupo, composicao: this.composicaoGrupo(g.top3) }))
      .filter((g): g is { nomeGrupo: string; composicao: { mediaTop3: number; segmentos: SegmentoBarra[] } } => g.composicao !== null)
      .sort((a, b) => b.composicao.mediaTop3 - a.composicao.mediaTop3);

    const max = comComposicao.length ? Math.max(...comComposicao.map((g) => g.composicao.mediaTop3)) : 0;

    return comComposicao.map((g) => ({
      nomeGrupo: g.nomeGrupo,
      mediaTop3: g.composicao.mediaTop3,
      percentual: max > 0 ? (g.composicao.mediaTop3 / max) * 100 : 0,
      segmentos: g.composicao.segmentos,
    }));
  }

  /**
   * Composição do score final em % de contribuição de cada eixo (qualidade/risco/preço),
   * pra colorir a barra por segmento. Contribuição = média do eixo (entre o top3) × peso
   * do eixo; eixo ausente conta como 0 — simplificação do rebalanceamento por ação que o
   * backend faz quando falta 1 eixo (normalizer.ts calcularScores), aceitável aqui porque
   * é uma média de grupo, não o score de uma ação específica.
   */
  private composicaoGrupo(top3: Top3Item[]): { mediaTop3: number; segmentos: SegmentoBarra[] } | null {
    const mediaTop3 = this.mediaEixo(top3, 'scoreFinal');
    if (mediaTop3 === null) return null;

    const mediaPorEixo: Record<Eixo, number | null> = {
      qualidade: this.mediaEixo(top3, 'scoreQualidade'),
      risco: this.mediaEixo(top3, 'scoreRisco'),
      preco: this.mediaEixo(top3, 'scorePreco'),
    };

    const contribPorEixo = (Object.keys(PESOS_EIXO) as Eixo[]).reduce((acc, eixo) => {
      acc[eixo] = (mediaPorEixo[eixo] ?? 0) * PESOS_EIXO[eixo];
      return acc;
    }, {} as Record<Eixo, number>);

    const totalContrib = contribPorEixo.qualidade + contribPorEixo.risco + contribPorEixo.preco;

    const segmentos: SegmentoBarra[] = (['qualidade', 'risco', 'preco'] as Eixo[]).map((eixo) => ({
      eixo,
      label: LABEL_EIXO[eixo],
      cor: COR_EIXO[eixo],
      percentual: totalContrib > 0 ? (contribPorEixo[eixo] / totalContrib) * 100 : 0,
      valorMedio: mediaPorEixo[eixo],
    }));

    return { mediaTop3, segmentos };
  }

  /**
   * Monta a geometria do gráfico de linha (posições em SVG, path por série) a partir do
   * histórico bruto — top N grupos por mediaTop3 do mês mais recente, cor fixa por ordem
   * (PALETA_CATEGORICA), eixo Y com domínio dinâmico (min/max com folga, arredondado).
   */
  private construirGraficoHistorico(dados: HistoricoRankingItem[]): GraficoHistorico | null {
    if (!dados.length) return null;

    const mesesDisponiveis = Array.from(new Set(dados.map((d) => d.anoMes))).sort();
    const ultimoMes = mesesDisponiveis[mesesDisponiveis.length - 1];

    const porGrupo = new Map<string, HistoricoRankingItem[]>();
    for (const d of dados) {
      if (!porGrupo.has(d.nomeGrupo)) porGrupo.set(d.nomeGrupo, []);
      porGrupo.get(d.nomeGrupo)!.push(d);
    }

    const gruposSelecionados = dados
      .filter((d) => d.anoMes === ultimoMes)
      .sort((a, b) => b.mediaTop3 - a.mediaTop3)
      .slice(0, TOP_N_HISTORICO)
      .map((d) => d.nomeGrupo);

    const largura = 640;
    const altura = 280;
    const margem = { top: 16, right: 20, bottom: 34, left: 46 };
    const plotW = largura - margem.left - margem.right;
    const plotH = altura - margem.top - margem.bottom;

    const xPara = (anoMes: string): number => {
      const i = mesesDisponiveis.indexOf(anoMes);
      return mesesDisponiveis.length > 1
        ? margem.left + (i / (mesesDisponiveis.length - 1)) * plotW
        : margem.left + plotW / 2;
    };

    const todosValores = gruposSelecionados.flatMap((g) => (porGrupo.get(g) ?? []).map((d) => d.mediaTop3));
    const valorMin = Math.min(...todosValores);
    const valorMax = Math.max(...todosValores);
    const amplitude = valorMax - valorMin || 0.2;
    const yMin = Math.max(0, Math.floor((valorMin - amplitude * 0.15) * 10) / 10);
    const yMax = Math.ceil((valorMax + amplitude * 0.15) * 10) / 10;

    const yPara = (valor: number): number => {
      const t = (valor - yMin) / (yMax - yMin || 1);
      return margem.top + (1 - t) * plotH;
    };

    const series: SerieLinha[] = gruposSelecionados.map((nomeGrupo, idx) => {
      const pontosOrdenados = (porGrupo.get(nomeGrupo) ?? [])
        .slice()
        .sort((a, b) => mesesDisponiveis.indexOf(a.anoMes) - mesesDisponiveis.indexOf(b.anoMes));

      const pontos: PontoLinha[] = pontosOrdenados.map((d) => ({
        anoMes: d.anoMes,
        x: xPara(d.anoMes),
        y: yPara(d.mediaTop3),
        valor: d.mediaTop3,
      }));

      const pathD = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

      return { nomeGrupo, cor: PALETA_CATEGORICA[idx % PALETA_CATEGORICA.length], pontos, pathD };
    });

    const nTicks = 4;
    const eixoY: EixoTick[] = Array.from({ length: nTicks }, (_, i) => {
      const valor = yMin + ((yMax - yMin) * i) / (nTicks - 1);
      return { y: yPara(valor), label: valor.toFixed(2) };
    });

    const eixoX: EixoTick[] = mesesDisponiveis.map((anoMes) => ({
      anoMes,
      x: xPara(anoMes),
      label: this.formatMes(anoMes),
    }));

    return { series, eixoX, eixoY, largura, altura };
  }

  onHoverPonto(chave: TipoHistorico, serie: SerieLinha, ponto: PontoLinha): void {
    this.hover = { chave, serie, ponto };
  }

  onHoverSai(): void {
    this.hover = null;
  }

  toggleTabela(chave: TipoHistorico): void {
    this.tabelaVisivel[chave] = !this.tabelaVisivel[chave];
  }

  valorNoMes(serie: SerieLinha, anoMes: string | undefined): number | null {
    if (!anoMes) return null;
    return serie.pontos.find((p) => p.anoMes === anoMes)?.valor ?? null;
  }

  private mediaEixo(top3: Top3Item[], campo: keyof Top3Item): number | null {
    const valores = top3.map((t) => t[campo]).filter((v): v is number => typeof v === 'number');
    if (!valores.length) return null;
    return valores.reduce((acc, v) => acc + v, 0) / valores.length;
  }

  formatScore(score: number | null): string {
    return score !== null ? score.toFixed(4) : '—';
  }

  scoreClass(score: number | null): string {
    if (score === null) return 'score--vazio';
    if (score >= 1.3) return 'score--alto';
    if (score >= 0.8) return 'score--medio';
    return 'score--baixo';
  }

  formatMes(anoMes: string): string {
    if (!anoMes) return '';
    const [ano, mes] = anoMes.split('-');
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[+mes]}/${ano}`;
  }

  get carregando(): boolean {
    return this.carregandoMeses || this.carregandoResumo;
  }
}
