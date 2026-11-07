import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FiscalService } from '../../../../services/fiscal.service';
import { BemDireito, BensDireitosAnual } from '../../../../interfaces/fiscal.interfaces';

interface FormAtivo {
  cnpj: string;
  razaoSocial: string;
  administrador: string;
  cnpjAdministrador: string;
}

@Component({
  selector: 'app-bens-direitos',
  templateUrl: './bens-direitos.component.html',
  // Reusa os estilos da página fiscal (cards, badges, botões) + os específicos desta aba.
  styleUrls: ['../fiscal.component.scss', './bens-direitos.component.scss'],
})
export class BensDireitosComponent implements OnChanges, OnDestroy {
  @Input() ano!: number;

  dados: BensDireitosAnual | null = null;
  carregando = false;
  erroCarga: string | null = null;

  // Corretora
  editandoCorretora = false;
  corretoraNome = '';
  corretoraCnpj = '';
  salvandoCorretora = false;
  erroCorretora: string | null = null;

  // Cadastro do ativo (uma linha expandida por vez)
  tickerEditando: string | null = null;
  formAtivo: FormAtivo = { cnpj: '', razaoSocial: '', administrador: '', cnpjAdministrador: '' };
  salvandoAtivo = false;
  erroAtivo: string | null = null;

  /** Chave do último item copiado (ticker + campo), pra mostrar "Copiado!" por 2s. */
  copiado: string | null = null;
  private timerCopiado: ReturnType<typeof setTimeout> | null = null;

  constructor(private fiscal: FiscalService) {}

  ngOnChanges(): void {
    this.carregar();
  }

  ngOnDestroy(): void {
    if (this.timerCopiado) clearTimeout(this.timerCopiado);
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarga = null;
    this.fiscal.getBensDireitos(this.ano).subscribe({
      next: (dados) => {
        this.dados = dados;
        this.carregando = false;
        this.corretoraNome = dados.corretoraNome ?? '';
        this.corretoraCnpj = dados.corretoraCnpj ? formatarCnpj(dados.corretoraCnpj) : '';
        this.editandoCorretora = !dados.corretoraNome;
      },
      error: (err) => {
        this.carregando = false;
        this.erroCarga = err?.error?.message ?? 'Erro ao carregar Bens e Direitos.';
      },
    });
  }

  get pendentes(): number {
    return this.dados?.itens.filter((i) => i.pendencias.length > 0).length ?? 0;
  }

  // ── Corretora ───────────────────────────────────────────────────────────
  salvarCorretora(): void {
    this.salvandoCorretora = true;
    this.erroCorretora = null;
    this.fiscal.salvarConfig({ corretoraNome: this.corretoraNome, corretoraCnpj: this.corretoraCnpj }).subscribe({
      next: () => {
        this.salvandoCorretora = false;
        this.carregar();
      },
      error: (err) => {
        this.salvandoCorretora = false;
        this.erroCorretora = mensagemErro(err, 'Erro ao salvar corretora.');
      },
    });
  }

  // ── Cadastro do ativo ───────────────────────────────────────────────────
  abrirCadastro(item: BemDireito): void {
    if (this.tickerEditando === item.ticker) {
      this.tickerEditando = null;
      return;
    }
    this.tickerEditando = item.ticker;
    this.erroAtivo = null;
    this.formAtivo = {
      cnpj: item.cnpj ? formatarCnpj(item.cnpj) : '',
      razaoSocial: item.razaoSocial ?? '',
      administrador: item.administrador ?? '',
      cnpjAdministrador: item.cnpjAdministrador ? formatarCnpj(item.cnpjAdministrador) : '',
    };
  }

  salvarAtivo(item: BemDireito): void {
    this.salvandoAtivo = true;
    this.erroAtivo = null;
    const payload = item.assetType === 'fii' ? this.formAtivo : { cnpj: this.formAtivo.cnpj, razaoSocial: this.formAtivo.razaoSocial };
    this.fiscal.salvarAtivo(item.ticker, payload).subscribe({
      next: () => {
        this.salvandoAtivo = false;
        this.tickerEditando = null;
        this.carregar();
      },
      error: (err) => {
        this.salvandoAtivo = false;
        this.erroAtivo = mensagemErro(err, 'Erro ao salvar cadastro.');
      },
    });
  }

  // ── Copiar ──────────────────────────────────────────────────────────────
  copiarTexto(texto: string, chave: string): void {
    copiarParaClipboard(texto).then((ok) => {
      if (!ok) return;
      this.copiado = chave;
      if (this.timerCopiado) clearTimeout(this.timerCopiado);
      this.timerCopiado = setTimeout(() => (this.copiado = null), 2000);
    });
  }

  /** Valor no formato que o programa da DIRPF aceita colar: 1234,56 (sem R$ nem milhar). */
  copiarValor(valor: number, chave: string): void {
    this.copiarTexto(valor.toFixed(2).replace('.', ','), chave);
  }

  formatarCnpj(cnpj: string | null): string {
    return cnpj ? formatarCnpj(cnpj) : '';
  }

  nomeClasse(item: BemDireito): string {
    return item.classe === 'OUTRO' ? '?' : item.classe;
  }
}

function formatarCnpj(digitos: string): string {
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function mensagemErro(err: any, padrao: string): string {
  const msg = err?.error?.message;
  return Array.isArray(msg) ? msg.join(' ') : msg ?? padrao;
}

async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Fallback pra contexto sem Clipboard API (http, permissão negada).
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
}
