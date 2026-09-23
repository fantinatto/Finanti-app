import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AdsService } from '../services/ads.service';

const AD_ACTION_ROUTES = [
  'time-tracking/punch',
  'activities',
  'board/activities',
  'board/tasks',
  'projects',
];

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private tokenCache: string | null = null;
  private lastAdsLoadTime = 0;
  private readonly ADS_LOAD_DEBOUNCE = 5000; // Não recarregar ads stats com frequência < 5s

  constructor(private adsService: AdsService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Pular interceptação para assets
    const isAsset = req.url.startsWith('/assets') || req.url.startsWith('./assets') || req.url.includes('/assets/');
    if (isAsset) {
      return next.handle(req);
    }

    const token = this.tokenCache || localStorage.getItem('finanti-token');
    if (!this.tokenCache && token) {
      this.tokenCache = token;
    }

    const isAbsolute = /^https?:\/\//.test(req.url);
    const shouldPrefix = !isAbsolute && !isAsset;

    // FormData (file upload) must NOT have Content-Type forced
    const isFormData = req.body instanceof FormData;

    const apiRequest = req.clone({
      setHeaders: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      url: shouldPrefix ? `${environment.apiUrl}/${req.url.replace(/^\//, '')}` : req.url,
    });

    const isActionPost =
      req.method === 'POST' &&
      AD_ACTION_ROUTES.some((r) => apiRequest.url.includes(r));

    return next.handle(apiRequest).pipe(
      tap((event: HttpEvent<any>) => {
        if (isActionPost && event instanceof HttpResponse) {
          // Adiar loadStats() para não bloquear a resposta
          const now = Date.now();
          if (now - this.lastAdsLoadTime > this.ADS_LOAD_DEBOUNCE) {
            this.lastAdsLoadTime = now;
            setTimeout(() => this.adsService.loadStats(), 100);
          }
        }
      }),
      // Retry apenas 1 vez para erros transientes
      retry({ count: 1, delay: 500 }),
      
      // Tratar erros HTTP
      catchError((error: HttpErrorResponse) => {
        // Erros de rede (status 0) são silent - sem retry
        if (error.status === 0) {
          return throwError(() => error);
        }

        let errorMessage = 'Ocorreu um erro inesperado';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro de conexão: ${error.error.message}`;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Dados inválidos enviados';
              break;
            case 401:
              errorMessage = 'Não autorizado';
              localStorage.removeItem('finanti-token');
              localStorage.removeItem('finanti-user');
              this.tokenCache = null;
              break;
            case 403:
              errorMessage = 'Acesso negado';
              break;
            case 404:
              // 404 é esperado em alguns casos, não logar
              return throwError(() => error);
            case 422:
              errorMessage = error.error?.message || 'Dados de validação falharam';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor';
              break;
            case 503:
              errorMessage = 'Serviço temporariamente indisponível';
              break;
            default:
              return throwError(() => error);
          }
        }

        console.warn('Erro na API:', { status: error.status, message: errorMessage, url: req.url });

        return throwError(() => ({
          message: errorMessage,
          status: error.status,
          originalError: error
        }));
      })
    );
  }
}