import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingComponent } from './ranking.component';
import { RankingRoutingModule } from './ranking-routing.module';

@NgModule({
  declarations: [RankingComponent],
  imports: [CommonModule, FormsModule, RankingRoutingModule],
})
export class RankingModule {}
