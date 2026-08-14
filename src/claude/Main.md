# 🚀 Fantiup - Plano de Implementação: Sistema de Licenciamento

## 📋 Contexto

**Stack:**
- Backend: NestJS + Prisma + Supabase PostgreSQL
- Frontend: Angular
- Deploy: Vercel

**Objetivo:**
Implementar sistema de monetização com planos FREE, PRO e TEAM, incluindo permissões por features e propagandas para usuários FREE.

---

## 🎯 Modelo de Negócio

### Planos

**FREE (Individual - $0/mês)**
- CV básico
- Time tracking: 50h/mês
- 5 skills
- 3 projetos
- ✅ Propagandas (Google AdSense)

**PRO (Individual - $9.90/mês)**
- CV completo
- Time tracking ilimitado
- Skills ilimitadas
- Analytics básico
- Export PDF/DOCX
- Medalhas e gamificação
- ❌ Sem propagandas

**TEAM (Empresa - $29/mês + $5/usuário)**
- Tudo do PRO
- Dashboard de equipe
- Analytics avançado
- Comparação de performance
- API access
- White-label
- SSO
- Até 50 usuários

---

## 🗄️ Schema Prisma - Mudanças Necessárias

### 1. Atualizar Model User (adicionar ao existente):

```prisma
model User {
  // ... campos existentes ...

  // ADICIONAR:
  subscriptionId          String?   @unique
  subscription            Subscription? @relation(fields: [subscriptionId], references: [id])
  enabledFeatures         String[]  @default([])
  organizationMemberships OrganizationMember[]
  usageRecords            UsageRecord[]
}
```

### 2. Atualizar Models para Analytics (adicionar campo):

```prisma
// Em Experience, Project e Skill, adicionar:
totalHours    Int       @default(0)

// Em Skill, adicionar também:
level         SkillLevel @default(INTERMEDIATE)
source        SkillSource @default(MANUAL)
lastUsedAt    DateTime?
```

### 3. Novos Models (adicionar ao final do schema):

```prisma
model Organization {
  id             String   @id @default(uuid())
  name           String
  slug           String   @unique
  planId         String
  plan           Plan     @relation(fields: [planId], references: [id])
  subscriptionId String?  @unique
  subscription   Subscription?
  maxUsers       Int      @default(50)
  members        OrganizationMember[]
  createdAt      DateTime @default(now())
  @@map("organizations")
}

model Plan {
  id               String   @id @default(uuid())
  name             String   @unique  // "FREE", "PRO", "TEAM"
  displayName      String
  priceMonthly     Decimal  @db.Decimal(10, 2)
  priceYearly      Decimal? @db.Decimal(10, 2)
  perUserPrice     Decimal? @db.Decimal(10, 2)
  limits           Json
  features         PlanFeature[]
  subscriptions    Subscription[]
  sortOrder        Int      @default(0)
  @@map("plans")
}

model Feature {
  id          String   @id @default(uuid())
  key         String   @unique  // "export_pdf", "remove_ads", etc
  name        String
  category    FeatureCategory
  plans       PlanFeature[]
  @@map("features")
}

model PlanFeature {
  id        String   @id @default(uuid())
  planId    String
  plan      Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  featureId String
  feature   Feature  @relation(fields: [featureId], references: [id], onDelete: Cascade)
  limit     Int?     // null = ilimitado, número = limite mensal
  @@unique([planId, featureId])
  @@map("plan_features")
}

model Subscription {
  id                   String   @id @default(uuid())
  userId               String?  @unique
  user                 User?
  planId               String
  plan                 Plan     @relation(fields: [planId], references: [id])
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  stripeSubscriptionId String?  @unique
  @@map("subscriptions")
}

model UsageRecord {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  featureKey String
  count      Int      @default(1)
  month      Int
  year       Int
  @@unique([userId, featureKey, month, year])
  @@map("usage_records")
}

enum FeatureCategory {
  CORE
  ANALYTICS
  EXPORT
  INTEGRATION
  CUSTOMIZATION
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  CANCELED
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

enum SkillSource {
  LINKEDIN
  MANUAL
  AUTO_DETECTED
}
```

**Comandos:**
```bash
npx prisma migrate dev --name add_licensing_system
npx prisma generate
```

---

## 🌱 Seed - Criar Planos e Features

**Arquivo:** `prisma/seed.ts`

Criar 3 planos (FREE, PRO, TEAM) com suas respectivas features:

**Features principais:**
- `cv_basic`, `cv_full`
- `time_tracking`, `skills_unlimited`
- `analytics_basic`, `analytics_advanced`
- `export_pdf`, `export_docx`
- `achievements`, `leaderboard`
- `remove_ads`, `white_label`
- `team_dashboard`, `api_access`

**Exemplo de limite:**
- FREE: `time_tracking` com limit=50
- PRO: `time_tracking` com limit=null (ilimitado)

**Comando:**
```bash
npx prisma db seed
```

---

## 🔐 Backend - PermissionsService

**Arquivo:** `src/permissions/permissions.service.ts`

**Métodos principais:**

```typescript
async canAccess(userId: string, featureKey: string): Promise<boolean>
// Verifica se user tem acesso à feature

async checkLimit(userId: string, featureKey: string, count: number = 1)
// Retorna: { allowed: boolean, remaining: number, limit: number }

async trackUsage(userId: string, featureKey: string, count: number = 1)
// Incrementa contador de uso mensal

async requireFeature(userId: string, featureKey: string)
// Lança ForbiddenException se não tem permissão

async getUserFeatures(userId: string): Promise<string[]>
// Retorna array de feature keys disponíveis

async getUserPlan(userId: string)
// Retorna Plan do usuário
```

**Criar também:** `src/permissions/permissions.module.ts`

---

## 🎯 Atualizar Controller de CV

**Arquivo:** `src/cv/cv.controller.ts`

**Mudanças no GET /api/v1/cv/me:**

```typescript
@Get('me')
async getCV(@Req() req) {
  const userId = req.user.id;
  const cvProfile = await this.cvService.getCVProfile(userId);
  
  // ADICIONAR:
  const userFeatures = await this.permissions.getUserFeatures(userId);
  const userPlan = await this.permissions.getUserPlan(userId);
  
  return {
    // ... dados existentes ...
    
    // MODIFICAR: Filtrar por plano
    skills: userFeatures.includes('cv_full') 
      ? cvProfile.skills 
      : cvProfile.skills.slice(0, 5),  // FREE: só 5 skills
    
    positions: userFeatures.includes('cv_full')
      ? cvProfile.experiences
      : cvProfile.experiences.slice(0, 3),  // FREE: só 3 experiências
    
    // ADICIONAR:
    plan: {
      name: userPlan?.name || 'FREE',
      features: userFeatures,
      limits: userPlan?.limits || {}
    }
  };
}
```

**Adicionar novo endpoint:**

```typescript
@Post('export-pdf')
async exportPDF(@Req() req) {
  const userId = req.user.id;
  
  await this.permissions.requireFeature(userId, 'export_pdf');
  await this.permissions.requireLimit(userId, 'export_pdf');
  
  const pdf = await this.cvService.generatePDF(userId);
  
  await this.permissions.trackUsage(userId, 'export_pdf');
  
  return pdf;
}
```

---

## 📢 Frontend - Propagandas

**Instalar:**
```bash
npm install ngx-google-adsense
```

**Configurar:** `app.module.ts`
```typescript
import { AdsenseModule } from 'ngx-google-adsense';

@NgModule({
  imports: [
    AdsenseModule.forRoot({
      adClient: 'ca-pub-XXXXXXXXXXXXXXXX'
    })
  ]
})
```

**Criar componente:** `src/app/shared/components/ads/ads.component.ts`

```typescript
@Component({
  selector: 'app-ads',
  template: `
    <div *ngIf="shouldShowAds" class="ads-container">
      <ng-adsense [adSlot]="adSlot" [width]="width" [height]="height"></ng-adsense>
      <small>Propaganda · <a routerLink="/pricing">Remover com PRO</a></small>
    </div>
  `
})
export class AdsComponent implements OnInit {
  @Input() adSlot: string;
  @Input() width = 728;
  @Input() height = 90;
  shouldShowAds = false;

  ngOnInit() {
    this.permissions.hasFeature('remove_ads').subscribe(has => {
      this.shouldShowAds = !has;
    });
  }
}
```

**Usar:**
```html
<app-ads adSlot="1234567890"></app-ads>
```

---

## 🎨 Frontend - PermissionsService

**Arquivo:** `src/app/services/permissions.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private cache$: Observable<UserPermissions>;

  constructor(private http: HttpClient) {
    this.cache$ = this.http.get<UserPermissions>('/api/v1/permissions/me')
      .pipe(shareReplay(1));
  }

  hasFeature(featureKey: string): Observable<boolean> {
    return this.cache$.pipe(
      map(perms => perms.features.includes(featureKey))
    );
  }

  isPro(): Observable<boolean> {
    return this.cache$.pipe(
      map(perms => perms.plan !== 'FREE')
    );
  }
}
```

**Criar directive:** `src/app/directives/has-feature.directive.ts`

```typescript
@Directive({ selector: '[appHasFeature]' })
export class HasFeatureDirective implements OnInit {
  @Input() appHasFeature: string;

  ngOnInit() {
    this.permissions.hasFeature(this.appHasFeature).subscribe(has => {
      if (has) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
```

**Usar:**
```html
<button *appHasFeature="'export_pdf'" (click)="exportPDF()">
  Exportar PDF
</button>

<div *ngIf="!(isPro() | async)">
  <app-ads></app-ads>
</div>
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Atualizar schema.prisma (User, Experience, Skill, Project)
- [ ] Adicionar novos models (Organization, Plan, Feature, etc)
- [ ] Rodar migration: `npx prisma migrate dev --name add_licensing_system`
- [ ] Criar seed.ts com planos e features
- [ ] Rodar seed: `npx prisma db seed`
- [ ] Criar PermissionsService
- [ ] Criar PermissionsModule
- [ ] Atualizar CVController (filtrar por plano)
- [ ] Adicionar endpoint POST /cv/export-pdf

### Frontend
- [ ] Instalar ngx-google-adsense
- [ ] Configurar AdsenseModule
- [ ] Criar AdsComponent
- [ ] Criar PermissionsService
- [ ] Criar HasFeatureDirective
- [ ] Adicionar ads nas páginas FREE
- [ ] Criar página de Pricing

### Futuro (Fase 2)
- [ ] Integração Stripe para pagamentos
- [ ] Webhooks do Stripe
- [ ] Página de checkout
- [ ] Dashboard de admin

---

## 📦 Dependências

**Backend:**
```bash
npm install -D ts-node  # Para seed
```

**Frontend:**
```bash
npm install ngx-google-adsense
```

---

## 🎯 Fluxo do Usuário

1. Usuário FREE acessa /cv → vê propagandas
2. Usuário FREE tenta exportar PDF → bloqueado (ou 1x/mês)
3. Usuário FREE vê só 5 skills e 3 experiências
4. Usuário clica "Upgrade para PRO"
5. Redireciona para /pricing
6. Escolhe plano e paga (Stripe - Fase 2)
7. Subscription ativa → features desbloqueadas
8. Propagandas removidas automaticamente

---

## 💡 Pontos de Atenção

1. **Usuários sem subscription** = FREE (padrão)
2. **Cache de features** em `User.enabledFeatures` para performance
3. **Limites mensais** resetam automaticamente (baseado em month/year)
4. **Organizations** compartilham 1 subscription entre membros
5. **Stripe** será integrado na Fase 2 (não implementar agora)

---

**Pronto para implementar!** 🚀