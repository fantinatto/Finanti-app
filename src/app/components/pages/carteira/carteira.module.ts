import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteiraComponent } from './carteira.component';
import { CarteiraRoutingModule } from './carteira-routing.module';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [CarteiraComponent],
  imports: [CommonModule, FormsModule, CarteiraRoutingModule, SharedModule],
})
export class CarteiraModule {}
