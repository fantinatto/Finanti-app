import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvestimentosComponent } from './investimentos.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: InvestimentosComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvestimentosRoutingModule {}
