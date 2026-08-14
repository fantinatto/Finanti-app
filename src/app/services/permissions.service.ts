import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  hasFeature(_featureKey: string): Observable<boolean> {
    return of(true);
  }

  getPlan(): Observable<string> {
    return of('FREE');
  }

  isPro(): Observable<boolean> {
    return of(false);
  }

  invalidateCache(): void {}
}
