import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FiscalComponent } from './fiscal.component';
import { FiscalRoutingModule } from './fiscal-routing.module';

@NgModule({
  declarations: [FiscalComponent],
  imports: [CommonModule, FormsModule, RouterModule, FiscalRoutingModule],
})
export class FiscalModule {}
