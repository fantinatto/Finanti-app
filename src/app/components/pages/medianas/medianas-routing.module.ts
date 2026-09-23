import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedianasComponent } from './medianas.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: MedianasComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedianasRoutingModule {}
