# Spec — fanti-up | Fase 1

## Mudanças em relação ao plano original
- Login com LinkedIn removido
- Login próprio (email/senha) adicionado
- Microsoft OAuth adicionado (substitui LinkedIn)
- Sistema de permissões e propagandas para plano FREE

---

## 1. Auth — Refatoração

### O que remover
- `AuthService.startLinkedin()`
- `LinkedinSyncService` (linkedin-sync.service.ts)
- Botão "Entrar com LinkedIn" na tela de login
- Callback handler para LinkedIn na página `/auth/callback`

### O que adicionar

#### Tela de Login (`/login`)
- Formulário: email + senha
- Botão "Entrar com Microsoft"
- Link "Criar conta" → `/signup`
- Link "Esqueci minha senha" (Fase 2)

#### Tela de Signup (`/signup`)
- Formulário: nome + email + senha + confirmar senha
- Validação reativa: email válido, senhas iguais, mínimo 8 chars
- Submit → `POST /api/v1/auth/register`
- Sucesso → redireciona para `/cv`

#### AuthService atualizado
```typescript
// Remover:
startLinkedin(): void
handleLinkedinCallback(code, state): Observable<void>

// Adicionar:
register(name, email, password): Observable<AuthResponse>
login(email, password): Observable<AuthResponse>
startMicrosoft(): void
handleMicrosoftCallback(code, state): Observable<void>
logout(): void
isAuthenticated(): boolean
getToken(): string | null
```

#### Auth Callback (`/auth/callback`)
- Tratar apenas Microsoft callback (remover lógica LinkedIn)
- Ler `code` e `state` da query string
- Chamar `handleMicrosoftCallback()` → armazenar JWT → redirecionar `/cv`

#### Armazenamento de sessão
- JWT em `sessionStorage` com chave `auth-token` (mantém padrão atual)
- Interceptor HTTP: adicionar `Authorization: Bearer <token>` em todas as requisições para `/api/v1`

---

## 2. PermissionsService

**Arquivo:** `src/app/services/permissions.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private cache$: Observable<UserPermissions>;

  constructor(private http: HttpClient) {
    this.cache$ = this.http.get<UserPermissions>('/api/v1/permissions/me')
      .pipe(shareReplay(1));
  }

  hasFeature(featureKey: string): Observable<boolean>
  isPro(): Observable<boolean>
  isTeam(): Observable<boolean>
  getPlan(): Observable<string>
  invalidateCache(): void  // chamar após upgrade de plano
}

interface UserPermissions {
  plan: string        // "FREE" | "PRO" | "TEAM"
  features: string[]  // ["cv_basic", "remove_ads", ...]
  limits: Record<string, number | null>
}
```

---

## 3. HasFeatureDirective

**Arquivo:** `src/app/directives/has-feature.directive.ts`

```typescript
// Uso: mostrar elemento apenas se usuário tem a feature
<button *appHasFeature="'export_pdf'" (click)="exportPDF()">
  Exportar PDF
</button>

// Uso: mostrar elemento apenas se NÃO tem a feature
<div *appHasFeature="'remove_ads'; else noAds">
  <app-ads></app-ads>
</div>
```

---

## 4. AdsComponent

**Arquivo:** `src/app/shared/components/ads/ads.component.ts`

```typescript
@Component({
  selector: 'app-ads',
  template: `
    <div *ngIf="shouldShowAds$ | async" class="ads-container">
      <ng-adsense [adSlot]="adSlot" [width]="width" [height]="height"></ng-adsense>
      <small>Propaganda · <a routerLink="/pricing">Remover com PRO</a></small>
    </div>
  `
})
export class AdsComponent {
  @Input() adSlot: string;
  @Input() width = 728;
  @Input() height = 90;
  shouldShowAds$ = this.permissions.hasFeature('remove_ads').pipe(map(has => !has));
}
```

**Instalar:**
```bash
npm install ngx-google-adsense
```

**Configurar em app.module.ts:**
```typescript
AdsenseModule.forRoot({ adClient: 'ca-pub-XXXXXXXXXXXXXXXX' })
```

**Onde usar:**
- Topo da página `/cv` (FREE)
- Entre seções do CV (FREE)

---

## 5. Página /pricing

**Rota:** `/pricing`

**Layout:** 3 cards lado a lado (FREE / PRO / TEAM)

**Conteúdo por card:**
```
FREE — Gratuito
- CV básico (5 skills, 3 experiências)
- Time tracking: 50h/mês
- Com propagandas
[Plano atual] (se FREE)

PRO — $9.90/mês
- CV completo ilimitado
- Time tracking ilimitado
- Export PDF/DOCX
- Medalhas e gamificação
- Sem propagandas
[Assinar] → Stripe (Fase 2, mostrar como disabled por ora)

TEAM — $29/mês + $5/usuário
- Tudo do PRO
- Dashboard de equipe
- Analytics avançado
- API access / White-label / SSO
- Até 50 usuários
[Falar com vendas] → email/contato
```

---

## 6. CV Page — Restrições FREE

**Arquivo:** `src/app/components/pages/cv/cv.component.ts`

Aplicar restrições na exibição:
- Skills: se FREE, exibir só 5 + botão "Ver todas com PRO →"
- Experiências: se FREE, exibir só 3 + botão "Ver todas com PRO →"
- Botão "Exportar PDF": `*appHasFeature="'export_pdf'"` (oculto para FREE)
- Banner de upgrade: exibir se FREE

---

## Checklist Frontend

### Auth
- [ ] Remover botão LinkedIn e lógica linkedin-sync.service.ts
- [ ] Atualizar `AuthService` (register, login, Microsoft OAuth)
- [ ] Criar formulário de login (email/senha)
- [ ] Criar formulário de signup (nome, email, senha, confirmar senha)
- [ ] Adicionar botão "Entrar com Microsoft"
- [ ] Atualizar `/auth/callback` (somente Microsoft)
- [ ] Garantir interceptor HTTP com Bearer token

### Permissions
- [ ] Criar `PermissionsService`
- [ ] Criar `HasFeatureDirective`
- [ ] Declarar directive no módulo correto

### Ads
- [ ] Instalar ngx-google-adsense
- [ ] Configurar AdsenseModule em app.module.ts
- [ ] Criar `AdsComponent`
- [ ] Inserir `<app-ads>` nas páginas FREE

### Pricing
- [ ] Criar rota `/pricing`
- [ ] Criar `PricingComponent` com 3 cards
- [ ] Botões PRO desabilitados (Stripe Fase 2)

### CV
- [ ] Aplicar `*appHasFeature` no botão PDF
- [ ] Limitar skills/experiências para FREE
- [ ] Adicionar botões "Ver todas com PRO"

### Não implementar agora (Fase 2)
- Stripe checkout
- Esqueci minha senha
- Dashboard admin
