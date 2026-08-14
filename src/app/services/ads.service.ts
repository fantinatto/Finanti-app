import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AdsStats {
  isPaidPlan: boolean;
  breakdown: {
    projects: number;
    workActivities: number;
    timeEntries: number;
    boardActivities: number;
  };
  totalActionsToday: number;
  videosRequired: number;
  videosWatchedToday: number;
  videosOwed: number;
}

@Injectable({ providedIn: 'root' })
export class AdsService {
  private stats$ = new BehaviorSubject<AdsStats | null>(null);
  readonly stats = this.stats$.asObservable();

  constructor(private http: HttpClient) {}

  get currentStats(): AdsStats | null {
    return this.stats$.value;
  }

  loadStats(): void {
    this.http.get<AdsStats>('ads/stats').subscribe({
      next: (s) => this.stats$.next(s),
      error: () => {},
    });
  }

  recordWatch(): Observable<AdsStats> {
    return this.http.post<AdsStats>('ads/watch', {}).pipe(
      tap((s) => this.stats$.next(s)),
    );
  }
}
