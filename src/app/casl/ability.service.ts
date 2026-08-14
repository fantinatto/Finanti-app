import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppAbility, Action, Subject, buildAbility } from './app-ability';

@Injectable({ providedIn: 'root' })
export class AbilityService {
  get ability(): AppAbility {
    return buildAbility(null);
  }

  can(_action: Action, _subject: Subject): boolean {
    return true;
  }

  cannot(_action: Action, _subject: Subject): boolean {
    return false;
  }

  can$(_action: Action, _subject: Subject): Observable<boolean> {
    return of(true);
  }
}
