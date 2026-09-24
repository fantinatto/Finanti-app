import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { SimulacaoComponent } from './simulacao.component';
import { SimulacaoRoutingModule } from './simulacao-routing.module';

@NgModule({
  declarations: [SimulacaoComponent],
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule, SimulacaoRoutingModule],
})
export class SimulacaoModule {}
