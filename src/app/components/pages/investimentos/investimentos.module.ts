import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvestimentosComponent } from './investimentos.component';
import { InvestimentosRoutingModule } from './investimentos-routing.module';

@NgModule({
  declarations: [InvestimentosComponent],
  imports: [CommonModule, FormsModule, RouterModule, InvestimentosRoutingModule],
})
export class InvestimentosModule {}
