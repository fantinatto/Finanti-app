import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MarketDataService } from '../../../services/market-data.service';
import { RankingItem } from '../../../interfaces/market-data.interfaces';

type TipoGrupo = 'setor' | 'segmento' | 'geral' | 'hibrido';
type OrdenacaoCampo =
  | 'scoreFinal'
  | 'scoreFinalDelta'
  | 'scoreQualidade'
  | 'qualidadeDelta'
  | 'scoreRisco'
  | 'riscoDelta'
  | 'scorePreco'
  | 'precoDelta';

interface CampoScoreMeta {
  campo: OrdenacaoCampo;
  label: string;
  /** Colunas Δ (Z-score/sigmoide) — diagnósticas/comparativas, não o score oficial. Ficam
   *  ocultas por padrão (toggle mostrarColunasExperimentais) pra a tabela caber sem scroll
   *  horizontal no caso comum de uso. */
  experimental: boolean;
}

/** Única fonte de verdade pras colunas de score — evita duplicar a lista de 8 campos entre
 *  cabeçalho da tabela, botões de ordenação e inputs de filtro mínimo. */
const CAMPOS_SCORE: CampoScoreMeta[] = [
  { campo: 'scoreFinal', label: 'Score Final', experimental: false },
  { campo: 'scoreFinalDelta', label: 'Score Final Δ', experimental: true },
  { campo: 'scoreQualidade', label: 'Qualidade', experimental: false },
  { campo: 'qualidadeDelta', label: 'Qualidade Δ', experimental: true },
  { campo: 'scoreRisco', label: 'Risco', experimental: false },
  { campo: 'riscoDelta', label: 'Risco Δ', experimental: true },
  { campo: 'scorePreco', label: 'Preço', experimental: false },
  { campo: 'precoDelta', label: 'Preço Δ', experimental: true },
];

/** grupoSelecionado === TODOS_GRUPOS pede o ranking sem filtrar por setor/segmento —
 *  o backend trata nomeGrupo vazio como "todos" (cada ação só pertence a um grupo por
 *  tipoGrupo, então isso não duplica linha nenhuma). */
const TODOS_GRUPOS = '';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
})
export class RankingComponent implements OnInit {
  readonly TODOS_GRUPOS = TODOS_GRUPOS;
  readonly camposScore = CAMPOS_SCORE;

  tipoGrupo: TipoGrupo = 'setor';
  meses: string[] = [];
  grupos: string[] = [];
  anoMesSelecionado = '';
  grupoSelecionado: string = TODOS_GRUPOS;

  itens: RankingItem[] = [];
  ordenarPor: OrdenacaoCampo = 'scoreFinal';

  /** Colunas Δ ficam ocultas por padrão — só a tela de diagnóstico avançado precisa delas. */
  mostrarColunasExperimentais = false;

  /** Filtro "maior ou igual a" por coluna de score — null = sem filtro nessa coluna. */
  filtrosMinimo: Record<OrdenacaoCampo, number | null> = {
    scoreFinal: null,
    scoreFinalDelta: null,
    scoreQualidade: null,
    qualidadeDelta: null,
    scoreRisco: null,
    riscoDelta: null,
    scorePreco: null,
    precoDelta: null,
  };

  carregandoMeses = false;
  carregandoGrupos = false;
  carregandoRanking = false;
  ingerindo = false;

  constructor(
    private marketData: MarketDataService,
    private toastr: ToastrService,
  ) {}

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
          this.carregarGrupos();
        }
        this.carregandoMeses = false;
      },
      error: () => { this.carregandoMeses = false; },
    });
  }

  carregarGrupos(): void {
    if (!this.anoMesSelecionado) return;
    this.grupos = [];
    this.grupoSelecionado = TODOS_GRUPOS;
    this.itens = [];

    if (this.tipoGrupo === 'geral' || this.tipoGrupo === 'hibrido') {
      // "Geral" é um bucket único (todo o mercado); "Híbrido" combina os 3 níveis numa nota
      // só por ação. Nenhum dos dois tem sub-grupo pra escolher — pula a busca e vai direto
      // pro ranking.
      this.carregarRanking();
      return;
    }

    this.carregandoGrupos = true;
    this.marketData.getGrupos(this.tipoGrupo, this.anoMesSelecionado).subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        this.carregandoGrupos = false;
      },
      error: () => { this.carregandoGrupos = false; },
    });
    this.carregarRanking();
  }

  carregarRanking(): void {
    if (!this.anoMesSelecionado) return;
    this.carregandoRanking = true;
    const request = this.tipoGrupo === 'hibrido'
      ? this.marketData.getRankingHibrido(this.anoMesSelecionado)
      : this.marketData.getRanking(this.tipoGrupo, this.grupoSelecionado, this.anoMesSelecionado);
    request.subscribe({
      next: (itens) => {
        this.itens = itens;
        this.carregandoRanking = false;
      },
      error: () => { this.carregandoRanking = false; },
    });
  }

  onTipoGrupoChange(): void {
    this.carregarGrupos();
  }

  onMesChange(): void {
    this.carregarGrupos();
  }

  onGrupoChange(): void {
    this.carregarRanking();
  }

  ordenar(campo: OrdenacaoCampo): void {
    this.ordenarPor = campo;
  }

  get camposScoreVisiveis(): CampoScoreMeta[] {
    return this.camposScore.filter((c) => this.mostrarColunasExperimentais || !c.experimental);
  }

  get temFiltroAtivo(): boolean {
    return Object.values(this.filtrosMinimo).some((v) => v !== null);
  }

  limparFiltros(): void {
    for (const c of this.camposScore) this.filtrosMinimo[c.campo] = null;
  }

  toggleColunasExperimentais(): void {
    this.mostrarColunasExperimentais = !this.mostrarColunasExperimentais;
    // Some a coluna, some o filtro — evita um filtro "fantasma" continuar ativo numa
    // coluna Δ que o usuário nem consegue mais ver/editar depois de recolher.
    if (!this.mostrarColunasExperimentais) {
      for (const c of this.camposScore) {
        if (c.experimental) this.filtrosMinimo[c.campo] = null;
      }
    }
  }

  get itenOrdenados(): RankingItem[] {
    const filtrados = this.itens.filter((item) =>
      this.camposScore.every((c) => {
        const minimo = this.filtrosMinimo[c.campo];
        if (minimo === null || minimo === undefined) return true;
        const valor = item[c.campo];
        return valor !== null && valor >= minimo;
      }),
    );

    return filtrados.sort((a, b) => {
      const va = a[this.ordenarPor] ?? -1;
      const vb = b[this.ordenarPor] ?? -1;
      return vb - va;
    });
  }

  dispararIngestion(): void {
    if (this.ingerindo) return;
    this.ingerindo = true;
    this.marketData.dispararIngestion().subscribe({
      next: (res) => {
        this.toastr.success(`${res.processadas} ações processadas`, 'Atualização concluída');
        this.ingerindo = false;
        this.carregarMeses();
      },
      error: () => {
        this.toastr.error('Falha ao atualizar dados', 'Erro');
        this.ingerindo = false;
      },
    });
  }

  scoreClass(score: number | null): string {
    if (score === null) return 'score--vazio';
    if (score >= 1.3) return 'score--alto';
    if (score >= 0.8) return 'score--medio';
    return 'score--baixo';
  }

  formatScore(score: number | null): string {
    return score !== null ? score.toFixed(4) : '—';
  }

  formatMes(anoMes: string): string {
    if (!anoMes) return '';
    const [ano, mes] = anoMes.split('-');
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[+mes]}/${ano}`;
  }

  get carregando(): boolean {
    return this.carregandoMeses || this.carregandoGrupos || this.carregandoRanking;
  }
}
