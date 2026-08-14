import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ErrorNotification {
  message: string;
  type: 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor() { }

  /**
   * Manipula erros de API e retorna uma resposta padrão
   */
  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      
      // Log do erro para debugging
      console.error(`${operation} failed:`, error);

      // Notificar usuário sobre o erro (pode ser integrado com toast/snackbar)
      this.notifyError({
        message: error.message || `Falha ao executar ${operation}`,
        type: 'error',
        duration: 5000
      });

      // Retorna um resultado vazio/padrão para manter a aplicação funcionando
      return of(result as T);
    };
  }

  /**
   * Exibe notificação de erro (pode ser integrado com toast/snackbar)
   */
  private notifyError(notification: ErrorNotification): void {
    // Por enquanto apenas log, mas pode ser conectado com:
    // - Angular Material Snackbar
    // - Toast notifications
    // - Sistema de notificações customizado
    
    console.warn('Error Notification:', notification);
    
    // Exemplo de como integrar com um serviço de notificações:
    // this.notificationService.show(notification.message, notification.type);
  }

  /**
   * Formatar erro para exibição amigável ao usuário
   */
  formatUserFriendlyError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  /**
   * Verificar se a aplicação está online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Retornar dados mock em caso de erro (útil para desenvolvimento)
   */
  getMockDataOnError<T>(mockData: T) {
    return (error: any): Observable<T> => {
      console.warn('Using mock data due to error:', error);
      return of(mockData);
    };
  }
}