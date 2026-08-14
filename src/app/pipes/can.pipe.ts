import { Pipe, PipeTransform } from '@angular/core';
import { AbilityService } from '../casl/ability.service';
import { Action, Subject } from '../casl/app-ability';

// Uso no template: *ngIf="'update' | can:'Project'"
@Pipe({ name: 'can', pure: false })
export class CanPipe implements PipeTransform {
  constructor(private ability: AbilityService) {}

  transform(action: Action, subject: Subject): boolean {
    return this.ability.can(action, subject);
  }
}
