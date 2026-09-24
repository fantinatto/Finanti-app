import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { InvestimentosComponent } from './investimentos.component';
import { InvestimentosRoutingModule } from './investimentos-routing.module';

@NgModule({
  declarations: [InvestimentosComponent],
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule, InvestimentosRoutingModule],
})
export class InvestimentosModule {}
