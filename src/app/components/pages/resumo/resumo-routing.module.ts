import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResumoComponent } from './resumo.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: ResumoComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResumoRoutingModule {}
