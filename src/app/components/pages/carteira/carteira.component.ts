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

/// Lista provisória — ainda não existe ingestão de fundamentos de FIIs no Finanti,
/// então não há uma fonte real de segmentos como existe hoje pra ações.
const SEGMENTOS_FII_PROVISORIOS = [
  'Lajes Corporativas',
  'Shoppings',
  'Logística',
  'Papel (CRI)',
  'Híbrido',
  'Fundo de Fundos',
  'Residencial',
  'Outros',
];

const BASES_PADRAO = [80, 100, 110, 120] as const;

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.scss'],
})
export class CarteiraComponent implements OnInit {
  readonly basesPadrao = BASES_PADRAO;
  readonly segmentosFiiProvisorios = SEGMENTOS_FII_PROVISORIOS;
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

  sugestaoInfo = '';
  aplicandoSugestao = false;
  erroSugestao = '';

  alocacoesSetor: AlocacaoItem[] = [];
  alocacoesSegmentoFii: AlocacaoItem[] = SEGMENTOS_FII_PROVISORIOS.map((nome) => ({ nome, percentual: 0 }));

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
    }).subscribe({
      next: ({ perfil, config, meses }) => {
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

    this.alocacoesSegmentoFii = SEGMENTOS_FII_PROVISORIOS.map((nome) => {
      const existente = config.alocacoesSegmentoFii.find((a) => a.segmento === nome);
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
      alocacoesSetor: this.alocacoesSetor,
      alocacoesSegmentoFii: this.alocacoesSegmentoFii,
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
