import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseService } from '../core/base.service';
import { BastidoresModel } from '../../../models/bastidores.model';

@Injectable({
  providedIn: 'root'
})
export class BastidoresService {
  private readonly tableName = 'bastidores';

  constructor(private base: BaseService) { } // ← Corrigido!

  /**
   * Busca todos os bastidores ativos
   */
  getBastidores(): Observable<BastidoresModel[]> {
    return from(
      this.base.table(this.tableName) 
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar bastidores:', error);
          return [];
        }
        return data || [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Busca bastidores em destaque
   */
  getFeaturedBastidores(): Observable<BastidoresModel[]> {
    return from(
      this.base.table(this.tableName) // ← Corrigido!
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: false })
        .limit(6)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar bastidores em destaque:', error);
          return [];
        }
        return data || [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Busca bastidores por categoria
   */
  getBastidoresByCategory(category: string): Observable<BastidoresModel[]> {
    return from(
      this.base.table(this.tableName) // ← Corrigido!
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('date', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar bastidores por categoria:', error);
          return [];
        }
        return data || [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Busca bastidores por idioma
   */
  getBastidoresByLanguage(language: string): Observable<BastidoresModel[]> {
    return from(
      this.base.table(this.tableName) // ← Corrigido!
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .order('date', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar bastidores por idioma:', error);
          return [];
        }
        return data || [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Busca bastidor por ID
   */
  getBastidorById(id: number): Observable<BastidoresModel | null> {
    return from(
      this.base.table(this.tableName) // ← Corrigido!
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar bastidor por ID:', error);
          return null;
        }
        return data;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Busca bastidores com filtros múltiplos
   */
  getBastidoresFiltered(filters: {
    category?: string;
    language?: string;
    search?: string;
    limit?: number;
  }): Observable<BastidoresModel[]> {
    return from(this.buildQuery(filters)).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar bastidores filtrados:', error);
          return [];
        }
        return data || [];
      }),
      catchError(() => of([]))
    );
  }

  /**
  * Seleciona oS 5 bastidores mais recentes 
  */
  async getRecentBastidores(is_active: boolean, limit: number): Promise<BastidoresModel[]> {
    const { data, error } = await this.base.table(this.tableName)
      .select('*')
      .eq('is_active', is_active)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erro ao buscar bastidores recentes:', error);
      return [];
    } 
    
    return data || [];
  }

  /**
   * Constrói query com filtros dinâmicos
   */
  private async buildQuery(filters: {
    category?: string;
    language?: string;
    search?: string;
    limit?: number;
  }) {
    let query = this.base.table(this.tableName)
      .select('*')
      .eq('is_active', true);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.language) {
      query = query.eq('language', filters.language);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('date', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }
}
