import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { FinancasComponent } from './financas.component';
import { FinancasRoutingModule } from './financas-routing.module';

@NgModule({
  declarations: [FinancasComponent],
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule, FinancasRoutingModule],
})
export class FinancasModule {}
