import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Injectable()
export class AutosaveService implements OnDestroy {
  private readonly _status$ = new BehaviorSubject<SaveStatus>('idle');
  readonly status$ = this._status$.asObservable();

  private readonly _trigger$ = new Subject<{ url: string; payload: unknown }>();
  private readonly sub: Subscription;

  constructor(private readonly http: HttpClient) {
    this.sub = this._trigger$
      .pipe(
        debounceTime(800),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap(({ url, payload }) => {
          this._status$.next('saving');
          return this.http.patch(url, payload).pipe(
            catchError(() => {
              this._status$.next('error');
              return of(null);
            }),
          );
        }),
      )
      .subscribe(res => {
        if (res !== null) {
          this._status$.next('saved');
          setTimeout(() => this._status$.next('idle'), 2000);
        }
      });
  }

  save(url: string, payload: unknown): void {
    this._trigger$.next({ url, payload });
  }

  get status(): SaveStatus {
    return this._status$.value;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
