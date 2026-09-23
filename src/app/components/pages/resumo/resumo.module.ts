import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumoComponent } from './resumo.component';
import { ResumoRoutingModule } from './resumo-routing.module';

@NgModule({
  declarations: [ResumoComponent],
  imports: [CommonModule, FormsModule, ResumoRoutingModule],
})
export class ResumoModule {}
