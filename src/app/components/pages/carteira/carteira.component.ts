import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PortfolioService } from '../../../services/portfolio.service';
import { UserService } from '../../../services/user.service';
import { MarketDataService } from '../../../services/market-data.service';
import { AlocacaoItem, PortfolioConfig, RegraSelecionada, TipoRankingRecomendacao } from '../../../interfaces/portfolio.interfaces';

const OPCOES_RANKING_RECOMENDACAO: { valor: TipoRankingRecomendacao; label: string; descricao: string }[] = [
  { valor: 'setor', label: 'Setor', descricao: 'Compara a ação com outras do mesmo setor.' },
  { valor: 'segmento', label: 'Segmento', descricao: 'Compara com outras do mesmo segmento (mais específico que setor).' },
  { valor: 'geral', label: 'Geral', descricao: 'Compara com o mercado inteiro, sem segregar por setor/segmento.' },
  { valor: 'hibrido', label: 'Híbrido', descricao: 'Combina Setor (60%) + Segmento (30%) + Geral (10%) numa nota só.' },
];

/// "Setor" de FII = tipo de fundo — taxonomia real e estável da Status Invest (ver
/// IngestionFiiService), diferente do segmento acima (ainda provisório): só 3 valores válidos
/// confirmados contra dados reais em 2026-10-08, não precisa de busca dinâmica.
const TIPOS_FUNDO_FII = ['Fundo de Tijolo', 'Fundo de Papel', 'Fundo Misto'];

const BASES_PADRAO = [80, 100, 110, 120] as const;

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.scss'],
})
export class CarteiraComponent implements OnInit {
  readonly basesPadrao = BASES_PADRAO;
  readonly tiposFundoFii = TIPOS_FUNDO_FII;

  /** Catálogo real de segmentos (Fii.segmento, ver IngestionFiiService.getSegmentos) — era lista
   * provisória hardcoded até 2026-10-08, trocada depois de confirmar que os nomes não batiam com
   * os reais (ex: "Logística" vs o real "Imóveis Industriais e Logísticos"), fazendo o
   * balanceamento mostrar alvo 100% subalocado mesmo com posição real no segmento. */
  segmentosFii: string[] = [];
  readonly opcoesRankingRecomendacao = OPCOES_RANKING_RECOMENDACAO;

  carregando = false;
  salvando = false;
  salvoComSucesso = false;
  erro = '';

  idade: number | null = null;
  temDataNascimento = false;

  percentualRendaFixa = 50;
  percentualFiis = 50;
  percentualAcoes = 50;
  percentualEstouro = 5;
  regraSelecionada: RegraSelecionada | null = null;
  baseRegraCustom: number | null = null;
  baseCustomInput: number | null = null;
  ajustarPorJuros = false;
  tipoRankingRecomendacao: TipoRankingRecomendacao = 'setor';
  permiteFracionario = true;

  sugestaoInfo = '';
  aplicandoSugestao = false;
  erroSugestao = '';

  alocacoesSetor: AlocacaoItem[] = [];
  alocacoesSegmentoFii: AlocacaoItem[] = [];
  alocacoesSetorFii: AlocacaoItem[] = TIPOS_FUNDO_FII.map((nome) => ({ nome, percentual: 0 }));

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService,
    private marketData: MarketDataService,
  ) {}

  ngOnInit(): void {
    this.carregarTudo();
  }

  private carregarTudo(): void {
    this.carregando = true;

    forkJoin({
      perfil: this.userService.getProfile(),
      config: this.portfolioService.getConfig(),
      meses: this.marketData.getMeses(),
      segmentosFii: this.marketData.getSegmentosFii(),
    }).subscribe({
      next: ({ perfil, config, meses, segmentosFii }) => {
        this.temDataNascimento = !!perfil.birthDate;
        this.idade = perfil.birthDate ? this.calcularIdade(perfil.birthDate) : null;

        const anoMesMaisRecente = meses[0];
        if (anoMesMaisRecente) {
          this.marketData.getGrupos('setor', anoMesMaisRecente).subscribe((setores) => {
            this.alocacoesSetor = setores.map((setor) => {
              const existente = config?.alocacoesSetor.find((a) => a.setor === setor);
              return { nome: setor, percentual: existente?.percentual ?? 0 };
            });
          });
        }

        this.segmentosFii = segmentosFii;
        this.alocacoesSegmentoFii = segmentosFii.map((nome) => {
          const existente = config?.alocacoesSegmentoFii.find((a) => a.segmento === nome);
          return { nome, percentual: existente?.percentual ?? 0 };
        });

        if (config) this.aplicarConfigCarregada(config);
        this.carregando = false;
      },
      error: () => { this.carregando = false; },
    });
  }

  private aplicarConfigCarregada(config: PortfolioConfig): void {
    this.percentualRendaFixa = config.percentualRendaFixa;
    this.percentualFiis = config.percentualFiis;
    this.percentualAcoes = config.percentualAcoes;
    this.percentualEstouro = config.percentualEstouro;
    this.regraSelecionada = config.regraSelecionada;
    this.baseRegraCustom = config.baseRegraCustom;
    this.ajustarPorJuros = config.regraSelecionada === 'base_di';
    this.tipoRankingRecomendacao = config.tipoRankingRecomendacao ?? 'setor';
    this.permiteFracionario = config.permiteFracionario ?? true;

    this.alocacoesSetorFii = TIPOS_FUNDO_FII.map((nome) => {
      const existente = config.alocacoesSetorFii.find((a) => a.setor === nome);
      return { nome, percentual: existente?.percentual ?? 0 };
    });
  }

  private calcularIdade(birthDateIso: string): number {
    const nascimento = new Date(birthDateIso);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFezAniversario =
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
    if (aindaNaoFezAniversario) idade--;
    return idade;
  }

  aplicarRegra(base: number): void {
    if (!this.temDataNascimento) return;
    this.aplicandoSugestao = true;
    this.erroSugestao = '';
    this.sugestaoInfo = '';

    const request = this.ajustarPorJuros ? this.portfolioService.getSugestaoDi(base) : this.portfolioService.getSugestaoBase(base);

    request.subscribe({
      next: (sugestao) => {
        this.percentualRendaFixa = Math.round((100 - sugestao.percentualSugerido) * 10) / 10;
        this.regraSelecionada = this.ajustarPorJuros ? 'base_di' : (BASES_PADRAO as readonly number[]).includes(base) ? (`base${base}` as RegraSelecionada) : 'base_custom';
        this.baseRegraCustom = base;
        this.sugestaoInfo = this.ajustarPorJuros && sugestao.contratoDi
          ? `Sugestão: ${sugestao.percentualSugerido.toFixed(1)}% em renda variável (idade ${sugestao.idade}, DI ${sugestao.contratoDi} a ${sugestao.taxaDi?.toFixed(2)}% a.a.)`
          : `Sugestão: ${sugestao.percentualSugerido.toFixed(1)}% em renda variável (idade ${sugestao.idade}, base ${base})`;
        this.aplicandoSugestao = false;
      },
      error: (err) => {
        // ApiInterceptor normaliza erros HTTP pra { message, status, originalError } — não é o HttpErrorResponse cru.
        this.erroSugestao = err?.message ?? 'Não foi possível calcular a sugestão agora.';
        this.aplicandoSugestao = false;
      },
    });
  }

  aplicarBaseCustom(): void {
    if (this.baseCustomInput != null) this.aplicarRegra(this.baseCustomInput);
  }

  onToggleJuros(): void {
    if (this.baseRegraCustom != null) this.aplicarRegra(this.baseRegraCustom);
  }

  usarManual(): void {
    this.regraSelecionada = null;
    this.baseRegraCustom = null;
    this.sugestaoInfo = '';
  }

  get descricaoRankingRecomendacao(): string {
    return this.opcoesRankingRecomendacao.find((o) => o.valor === this.tipoRankingRecomendacao)?.descricao ?? '';
  }

  get somaFiisAcoes(): number {
    return this.percentualFiis + this.percentualAcoes;
  }

  get somaAlocacoesSetor(): number {
    return this.alocacoesSetor.reduce((acc, a) => acc + (a.percentual || 0), 0);
  }

  get somaAlocacoesSegmentoFii(): number {
    return this.alocacoesSegmentoFii.reduce((acc, a) => acc + (a.percentual || 0), 0);
  }

  get somaAlocacoesSetorFii(): number {
    return this.alocacoesSetorFii.reduce((acc, a) => acc + (a.percentual || 0), 0);
  }

  salvar(): void {
    this.salvando = true;
    this.salvoComSucesso = false;
    this.erro = '';

    this.portfolioService.upsertConfig({
      percentualRendaFixa: this.percentualRendaFixa,
      percentualFiis: this.percentualFiis,
      percentualAcoes: this.percentualAcoes,
      percentualEstouro: this.percentualEstouro,
      regraSelecionada: this.regraSelecionada ?? undefined,
      baseRegraCustom: this.baseRegraCustom ?? undefined,
      tipoRankingRecomendacao: this.tipoRankingRecomendacao,
      permiteFracionario: this.permiteFracionario,
      alocacoesSetor: this.alocacoesSetor,
      alocacoesSegmentoFii: this.alocacoesSegmentoFii,
      alocacoesSetorFii: this.alocacoesSetorFii,
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.salvoComSucesso = true;
      },
      error: () => {
        this.salvando = false;
        this.erro = 'Não foi possível salvar a carteira. Tente novamente.';
      },
    });
  }
}
