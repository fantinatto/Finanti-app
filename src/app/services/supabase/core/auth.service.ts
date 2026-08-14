import { Injectable } from '@angular/core';
import { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClientService } from '../supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   
  private _client: SupabaseClient;
  private _user = new BehaviorSubject<User | null>(null);
  private _session = new BehaviorSubject<Session | null>(null);

  public readonly user$ = this._user.asObservable();
  public readonly session$ = this._session.asObservable();

  constructor(private supabaseClientService: SupabaseClientService) {
    this._client = this.supabaseClientService.client;
    
    this.initializeAuth();
  }

  /**
   * Usuário atual
   */
  get currentUser(): User | null {
    return this._user.value;
  }

  /**
   * Verifica se usuário está autenticado
   */
  get isAuthenticated(): boolean {
    return !!this._user.value;
  }

  /**
   * Cliente de autenticação
   */
  get auth() {
    return this._client.auth;
  }

  /**
   * Login com email e senha
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this._client.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  /**
   * Cadastro com email e senha
   */
  async signUp(email: string, password: string) {
    const { data, error } = await this._client.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  /**
   * Logout
   */
  async signOut() {
    const { error } = await this._client.auth.signOut();
    return { error };
  }

  /**
   * Inicializa o estado de autenticação
   */
  private async initializeAuth(): Promise<void> {
    // Verificar sessão atual
    const { data: { session } } = await this._client.auth.getSession();
    this._session.next(session);
    this._user.next(session?.user || null);

    // Escutar mudanças de autenticação
    this._client.auth.onAuthStateChange((event, session) => {
      this._session.next(session);
      this._user.next(session?.user || null);
    });
  }
}