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
