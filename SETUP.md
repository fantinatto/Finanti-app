# Finanti App — Visão Geral

Frontend do Finanti. Angular 15 + Supabase + Vercel.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Angular 15 |
| Auth | JWT via Finanti API |
| i18n | ngx-translate (pt/en) |
| Notificações | ngx-toastr |
| Permissões | CASL (simplificado) |
| Deploy | Vercel |

## Estrutura de pastas relevante

```
src/app/
├── app.module.ts              # Módulo raiz
├── app-routing.module.ts      # Rotas ativas do Finanti
├── app.component.ts/html      # Shell — header + router-outlet + footer
├── services/
│   ├── auth.service.ts        # Login, register, forgot/reset, signOut — JWT via API
│   ├── permissions.service.ts # Stub — sempre retorna true (sem orgs ainda)
│   └── supabase/              # SupabaseClient singleton + BaseService
├── interceptors/
│   └── api.interceptor.ts     # Adiciona Bearer token + retry + error handling
├── casl/
│   ├── app-ability.ts         # Modelo de permissões (simplificado)
│   └── ability.service.ts     # Stub — manage all
├── shared/                    # Componentes reutilizáveis (inputs, spinner, layout)
├── components/
│   ├── pages/
│   │   ├── auth/              # Login, signup, forgot-password, reset-password
│   │   ├── account/           # Account settings, billing (stubs)
│   │   └── legal/             # Privacidade, termos, contato
│   └── core/                  # CoreModule (vazio — sem home page ainda)
```

## Módulos previstos (a criar)

| Módulo | Rota | Responsabilidade |
|---|---|---|
| `dashboard` | `/dashboard` | Visão geral do patrimônio |
| `passivos` | `/passivos` | CRUD de contas mensais |
| `ganhos` | `/ganhos` | CRUD de fontes de renda |
| `carteira` | `/carteira` | Investimentos e rebalanceamento |
| `ranking` | `/ranking` | Ranking de ações B3 com scoring |

## Rotas ativas

```
/auth/login           ← rota padrão (redireciona de /)
/auth/signup
/auth/forgot-password
/auth/reset-password
/account              ← stub (em desenvolvimento)
/privacidade
/termos
/contato
```

## Auth flow

1. Usuário envia email + senha no login
2. `AuthService.login()` chama `POST /api/v1/auth/login`
3. API retorna `{ accessToken, user }`
4. Token salvo em `localStorage` com chave `finanti-token`
5. `ApiInterceptor` injeta `Authorization: Bearer <token>` em todas as requisições
6. `AppComponent` redireciona para `/auth/login` se não autenticado

## Variáveis de ambiente (.env)

```
NEXT_PUBLIC_SUPABASE_URL=https://lclyhjytdtajehquthbq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
VERCEL_OIDC_TOKEN=
```

## Como rodar

```bash
npm install
ng serve -c dev     # development
ng serve            # usa configuration padrão
ng build --configuration=production
```

## Origem dos artefatos

Este projeto foi bootstrapped a partir do `fanti-up` (Angular 15). Artefatos copiados e mantidos:
- Infraestrutura Angular (package.json, angular.json, tsconfig, proxy, vercel.json)
- `ApiInterceptor` — Bearer token, retry, error handling
- `SupabaseClientService` + `BaseService`
- `SharedModule` — inputs, spinner, layout components
- `CASL` — ability model (simplificado para Finanti)
- Módulo `auth` — adaptado (removido OAuth, `UnifiedAuthService` substituído por `AuthService` simples)
- Módulos `account`, `legal` — mantidos (billing/settings como stubs)

Removidos: CV, Board, Ponto, Blog, Labs, integrations (Microsoft/Google/LinkedIn/AzureDevOps/SolMan/Trello), WorkspaceService, home/bastidores/pricing pages.
