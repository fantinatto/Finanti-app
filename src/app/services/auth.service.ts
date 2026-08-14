import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface AuthUser {
  id: string;
  displayName: string;
  primaryEmail: string;
  avatarUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

const TOKEN_KEY = 'finanti-token';
const USER_KEY  = 'finanti-user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _state = new BehaviorSubject<AuthState>(this.loadState());
  readonly authState$ = this._state.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get isAuthenticated(): boolean {
    return this._state.value.isAuthenticated;
  }

  get currentUser(): AuthUser | null {
    return this._state.value.user;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/register', { name, email, password }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  signOut(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._state.next({ isAuthenticated: false, user: null });
    this.router.navigate(['/auth/login']);
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._state.next({ isAuthenticated: true, user: res.user });
  }

  private loadState(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (!token || !raw) return { isAuthenticated: false, user: null };
    try {
      return { isAuthenticated: true, user: JSON.parse(raw) };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  }
}
