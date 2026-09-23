import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColetaComponent } from './coleta.component';
import { ColetaRoutingModule } from './coleta-routing.module';

@NgModule({
  declarations: [ColetaComponent],
  imports: [CommonModule, FormsModule, ColetaRoutingModule],
})
export class ColetaModule {}
