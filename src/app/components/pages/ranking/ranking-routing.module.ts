import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RankingComponent } from './ranking.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: RankingComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RankingRoutingModule {}
