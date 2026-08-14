import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface LookupItem {
  value: string;
  labelPt: string;
  labelEn: string | null;
}

export type LookupCategory = 'employment_type' | 'proficiency_level' | 'degree_type' | 'location_type';

@Injectable({ providedIn: 'root' })
export class LookupsService {
  private readonly cache = new Map<string, Observable<LookupItem[]>>();

  constructor(private readonly http: HttpClient) {}

  get(category: LookupCategory): Observable<LookupItem[]> {
    if (!this.cache.has(category)) {
      const req$ = this.http
        .get<LookupItem[]>(`/lookups/${category}`)
        .pipe(shareReplay(1));
      this.cache.set(category, req$);
    }
    return this.cache.get(category)!;
  }

  get employmentTypes$() { return this.get('employment_type'); }
  get proficiencyLevels$() { return this.get('proficiency_level'); }
  get degreeTypes$() { return this.get('degree_type'); }
  get locationTypes$() { return this.get('location_type'); }
}
