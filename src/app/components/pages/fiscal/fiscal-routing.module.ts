import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FiscalComponent } from './fiscal.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: FiscalComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FiscalRoutingModule {}
