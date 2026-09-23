import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedianasComponent } from './medianas.component';
import { MedianasRoutingModule } from './medianas-routing.module';

@NgModule({
  declarations: [MedianasComponent],
  imports: [CommonModule, FormsModule, MedianasRoutingModule],
})
export class MedianasModule {}
