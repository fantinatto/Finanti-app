import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { SupabaseClientService } from '../supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  
  private _client: SupabaseClient;
  private _authService: AuthService;

  constructor(
    authService: AuthService,
    private supabaseClientService: SupabaseClientService
  ) {
    this._authService = authService;
    this._client = this.supabaseClientService.client;
  }

  get authService(): AuthService {  
    return this._authService;
  }

  /**
   * Cliente Supabase para operações diretas
   */
  get client(): SupabaseClient {
    return this._client;
  }

  /**
   * Acesso rápido a uma tabela
   */
  table(tableName: string) {
    return this._client.from(tableName);
  }

  /**
   * Verifica se a conexão está funcionando
   */
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await this._client
        .from('bastidores')
        .select('count')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}