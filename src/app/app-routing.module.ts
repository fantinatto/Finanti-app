import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./components/pages/account/account.module').then(m => m.AccountModule)
  },
  {
    path: 'ranking',
    loadChildren: () => import('./components/pages/ranking/ranking.module').then(m => m.RankingModule)
  },
  {
    path: 'coleta',
    loadChildren: () => import('./components/pages/coleta/coleta.module').then(m => m.ColetaModule)
  },
  {
    path: 'medianas',
    loadChildren: () => import('./components/pages/medianas/medianas.module').then(m => m.MedianasModule)
  },
  {
    path: 'resumo',
    loadChildren: () => import('./components/pages/resumo/resumo.module').then(m => m.ResumoModule)
  },
  // Carteira de Investimentos (parâmetros) virou uma aba dentro de Configurações — bookmark antigo
  // redireciona pra lá em vez de dar 404.
  { path: 'carteira', redirectTo: 'account/settings', pathMatch: 'full' },
  {
    path: 'investimentos',
    loadChildren: () => import('./components/pages/investimentos/investimentos.module').then(m => m.InvestimentosModule)
  },
  {
    path: 'simulacao',
    loadChildren: () => import('./components/pages/simulacao/simulacao.module').then(m => m.SimulacaoModule)
  },
  {
    path: 'privacidade',
    loadChildren: () => import('./components/pages/legal/legal.module').then(m => m.LegalModule)
  },
  {
    path: 'termos',
    loadChildren: () => import('./components/pages/legal/legal.module').then(m => m.LegalModule)
  },
  {
    path: 'contato',
    loadChildren: () => import('./components/pages/legal/legal.module').then(m => m.LegalModule)
  },

  { path: 'settings', redirectTo: '/account/settings', pathMatch: 'full' },
  { path: 'billing', redirectTo: '/account/billing', pathMatch: 'full' },
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'signup', redirectTo: '/auth/signup', pathMatch: 'full' },
  { path: 'forgot-password', redirectTo: '/auth/forgot-password', pathMatch: 'full' },
  { path: 'reset-password', redirectTo: '/auth/reset-password', pathMatch: 'full' },

  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
