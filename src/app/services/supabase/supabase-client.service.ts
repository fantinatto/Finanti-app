import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Singleton service for Supabase client.
 * This ensures only ONE instance of the Supabase client exists,
 * preventing Navigator Lock conflicts.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private static _instance: SupabaseClient | null = null;

  constructor() {
    // Singleton pattern - create only once
    if (!SupabaseClientService._instance) {
      SupabaseClientService._instance = createClient(
        environment.supabase.supabaseUrl,
        environment.supabase.supabaseAnonKey,
        {
          auth: {
            // Use localStorage instead of sessionStorage
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            // Disable auto-refresh to prevent lock conflicts
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            // Use a custom storage key to avoid conflicts
            storageKey: 'fanti-up-auth',
            // Flow type
            flowType: 'pkce',
            // Lock configuration - no-op lock to avoid navigator locks
            lock: async (_name, _acquireTimeout, fn) => await fn()
          }
        }
      );
    }
  }

  /**
   * Get the singleton Supabase client instance
   */
  get client(): SupabaseClient {
    return SupabaseClientService._instance!;
  }

  /**
   * Get the auth module
   */
  get auth() {
    return this.client.auth;
  }

  /**
   * Get a table reference for queries
   */
  from(tableName: string) {
    return this.client.from(tableName);
  }
}
