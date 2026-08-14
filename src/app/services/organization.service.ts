import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ModuleKey = 'PLANNING' | 'HR' | 'FINANCIAL' | 'NFSE' | 'INTEGRATIONS';
export type ModuleStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

export interface OrgModule {
  moduleKey: ModuleKey;
  status: ModuleStatus;
  activatedAt: string | null;
}

export interface OrgBilling {
  hasStripeCustomer: boolean;
  subscription: { status: string; plan: string; currentPeriodEnd: string } | null;
  modules: OrgModule[];
}

export interface ActivateModuleResponse {
  checkoutUrl?: string;
  message?: string;
}

export interface StripeProduct {
  id: string;
  name: string;
  moduleKey: string | null;
  priceId: string | null;
  description: string | null;
  features: string | null;
  imageUrl: string | null;
  unitAmount: number | null;
  currency: string;
  priceType: string;
  interval: string | null;
  metadata: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(private http: HttpClient) {}

  listModules(orgId: string): Observable<OrgModule[]> {
    return this.http.get<OrgModule[]>(`organizations/${orgId}/modules`);
  }

  activateModule(orgId: string, moduleKey: ModuleKey, priceId?: string): Observable<ActivateModuleResponse> {
    return this.http.post<ActivateModuleResponse>(`organizations/${orgId}/modules`, { moduleKey, priceId });
  }

  individualCheckout(priceId: string, priceType: string): Observable<ActivateModuleResponse> {
    return this.http.post<ActivateModuleResponse>('stripe/checkout/individual', { priceId, priceType });
  }

  cancelModule(orgId: string, moduleKey: ModuleKey): Observable<{ canceled: boolean }> {
    return this.http.delete<{ canceled: boolean }>(`organizations/${orgId}/modules/${moduleKey}`);
  }

  getBilling(orgId: string): Observable<OrgBilling> {
    return this.http.get<OrgBilling>(`organizations/${orgId}/billing`);
  }

  getBillingPortal(orgId: string): Observable<{ portalUrl: string }> {
    return this.http.post<{ portalUrl: string }>(`organizations/${orgId}/billing/portal`, {});
  }

  testStripeConnection(): Observable<{ ok: boolean; message: string; accountId?: string }> {
    return this.http.get<{ ok: boolean; message: string; accountId?: string }>('stripe/test');
  }

  getStripeProducts(): Observable<StripeProduct[]> {
    return this.http.get<StripeProduct[]>('stripe/products');
  }

  syncStripeProducts(): Observable<{ synced: number; skipped: number }> {
    return this.http.post<{ synced: number; skipped: number }>('stripe/sync', {});
  }
}
