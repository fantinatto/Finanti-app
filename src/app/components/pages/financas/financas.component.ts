import { Component, OnInit } from '@angular/core';
import { FinancasService } from '../../../services/financas.service';
import { FORMAS_PAGAMENTO, GanhoMensal, GastoMensal, MesFinanceiro } from '../../../interfaces/financas.interfaces';

const MESES_LABEL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface FormGasto {
  nome: string;
  formaPagamento: string;
  valor: number | null;
  pago: boolean;
  dataVencimento: string;
}

interface FormGanho {
  nome: string;
  valor: number | null;
  recebido: boolean;
}

@Component({
  selector: 'app-financas',
  templateUrl: './financas.component.html',
  styleUrls: ['./financas.component.scss'],
})
export class FinancasComponent implements OnInit {
  readonly formasPagamento = FORMAS_PAGAMENTO;

  anoMesSelecionado = '';
  mes: MesFinanceiro | null = null;
  carregando = false;

  editandoGastoId: string | null = null;
  formGasto: FormGasto = this.formGastoVazio();

  editandoGanhoId: string | null = null;
  formGanho: FormGanho = this.formGanhoVazio();

  constructor(private readonly financas: FinancasService) {}

  ngOnInit(): void {
    const hoje = new Date();
    this.anoMesSelecionado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    this.carregarMes();
  }

  carregarMes(): void {
    this.carregando = true;
    this.financas.getMes(this.anoMesSelecionado).subscribe({
      next: (mes) => { this.mes = mes; this.carregando = false; },
      error: () => { this.carregando = false; },
    });
  }

  mudarMes(delta: number): void {
    const [ano, mesNum] = this.anoMesSelecionado.split('-').map(Number);
    const data = new Date(ano, mesNum - 1 + delta, 1);
    this.anoMesSelecionado = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    this.cancelarEdicaoGasto();
    this.cancelarEdicaoGanho();
    this.carregarMes();
  }

  formatMesLabel(anoMes: string): string {
    const [ano, mesNum] = anoMes.split('-').map(Number);
    return `${MESES_LABEL[mesNum - 1]}/${ano}`;
  }

  // ── Gastos ────────────────────────────────────────────────────────────────

  iniciarEdicaoGasto(g: GastoMensal): void {
    this.editandoGastoId = g.id;
    this.formGasto = {
      nome: g.nome,
      formaPagamento: g.formaPagamento ?? '',
      valor: g.valor,
      pago: g.pago,
      dataVencimento: this.toDateInputValue(g.dataVencimento),
    };
  }

  cancelarEdicaoGasto(): void {
    this.editandoGastoId = null;
    this.formGasto = this.formGastoVazio();
  }

  salvarGasto(): void {
    if (!this.formGasto.nome.trim() || this.formGasto.valor === null) return;
    const payload = {
      nome: this.formGasto.nome.trim(),
      formaPagamento: this.formGasto.formaPagamento || undefined,
      valor: this.formGasto.valor,
      pago: this.formGasto.pago,
      dataVencimento: this.formGasto.dataVencimento || undefined,
    };
    const obs = this.editandoGastoId
      ? this.financas.atualizarGasto(this.editandoGastoId, payload)
      : this.financas.criarGasto(this.anoMesSelecionado, payload);
    obs.subscribe(() => { this.cancelarEdicaoGasto(); this.carregarMes(); });
  }

  removerGasto(id: string): void {
    this.financas.removerGasto(id).subscribe(() => {
      if (this.editandoGastoId === id) this.cancelarEdicaoGasto();
      this.carregarMes();
    });
  }

  togglePago(g: GastoMensal): void {
    this.financas
      .atualizarGasto(g.id, {
        nome: g.nome,
        formaPagamento: g.formaPagamento ?? undefined,
        valor: g.valor,
        pago: !g.pago,
        dataVencimento: g.dataVencimento ? this.toDateInputValue(g.dataVencimento) : undefined,
      })
      .subscribe(() => this.carregarMes());
  }

  percentualGasto(g: GastoMensal): string {
    if (!this.mes || this.mes.totalGastos <= 0) return '—';
    return `${((g.valor / this.mes.totalGastos) * 100).toFixed(1)}%`;
  }

  // ── Ganhos ────────────────────────────────────────────────────────────────

  iniciarEdicaoGanho(g: GanhoMensal): void {
    this.editandoGanhoId = g.id;
    this.formGanho = { nome: g.nome, valor: g.valor, recebido: g.recebido };
  }

  cancelarEdicaoGanho(): void {
    this.editandoGanhoId = null;
    this.formGanho = this.formGanhoVazio();
  }

  salvarGanho(): void {
    if (!this.formGanho.nome.trim() || this.formGanho.valor === null) return;
    const payload = { nome: this.formGanho.nome.trim(), valor: this.formGanho.valor, recebido: this.formGanho.recebido };
    const obs = this.editandoGanhoId
      ? this.financas.atualizarGanho(this.editandoGanhoId, payload)
      : this.financas.criarGanho(this.anoMesSelecionado, payload);
    obs.subscribe(() => { this.cancelarEdicaoGanho(); this.carregarMes(); });
  }

  removerGanho(id: string): void {
    this.financas.removerGanho(id).subscribe(() => {
      if (this.editandoGanhoId === id) this.cancelarEdicaoGanho();
      this.carregarMes();
    });
  }

  toggleRecebido(g: GanhoMensal): void {
    this.financas.atualizarGanho(g.id, { nome: g.nome, valor: g.valor, recebido: !g.recebido }).subscribe(() => this.carregarMes());
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatMoeda(v: number | null): string {
    if (v === null) return '—';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatData(iso: string | null): string {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }

  toDateInputValue(iso: string | null): string {
    return iso ? iso.slice(0, 10) : '';
  }

  private formGastoVazio(): FormGasto {
    return { nome: '', formaPagamento: '', valor: null, pago: false, dataVencimento: '' };
  }

  private formGanhoVazio(): FormGanho {
    return { nome: '', valor: null, recebido: false };
  }
}
