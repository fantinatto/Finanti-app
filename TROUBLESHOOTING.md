# Finanti App — Erros Frequentes

## 1. Invalid target: {"project":"angular-test", ...}

**Sintoma:**
```
An unhandled exception occurred: Invalid target: {"project":"angular-test","target":"build","configuration":"dev"}
```

**Causa:** O `angular.json` ainda tinha referências ao nome antigo do projeto (`angular-test`) em targets de `serve`, `extract-i18n` e `test`.

**Solução:** Substituir todas as ocorrências de `angular-test` por `finanti-app` no `angular.json`:
```bash
sed -i 's/angular-test/finanti-app/g' angular.json
```
Verificar: `grep "angular-test" angular.json` deve retornar vazio.

---

## 2. Property 'showMobileMenu' does not exist on type 'AppComponent'

**Sintoma:**
```
error TS2339: Property 'showMobileMenu' does not exist on type 'AppComponent'
```

**Causa:** O `app.component.html` foi copiado do `fanti-up` e referencia propriedades (`showMobileMenu`, `showUserMenu`, `showWorkspaceSwitcher`, `workspaceService`) que não existem no `AppComponent` do Finanti.

**Solução:** Reescrever o `app.component.html` com o template do Finanti (header simples com logo, nav e botão de logout). O template do fanti-up tinha workspace switcher e mobile nav drawer que foram removidos.

---

## 3. Cannot find module '../services/auth/unified-auth.service'

**Sintoma:**
```
error TS2307: Cannot find module '../../../services/auth/unified-auth.service'
```

**Causa:** Componentes de auth (`login`, `signup`, `forgot-password`, `reset-password`) foram copiados com import para `UnifiedAuthService`, que foi deletado.

**Solução:**
1. Trocar o import para `AuthService` em `../../../services/auth.service`
2. Renomear a injeção no constructor
3. Adaptar os métodos chamados:
   - `signInWithEmail(email, password)` → `firstValueFrom(this.authService.login(email, password))`
   - `signUpWithEmail(email, password, name)` → `firstValueFrom(this.authService.register(name, email, password))`
   - `forgotPassword` e `resetPassword` → mesmo nome, mas converter de `await` com `{ success, error }` para `firstValueFrom` + try/catch
4. Remover chamadas `startOAuth(...)` e botões OAuth do template

---

## 4. Property 'startOAuth' / 'signupWithMicrosoft' does not exist

**Sintoma:**
```
error TS2339: Property 'startOAuth' does not exist on type 'AuthService'
error TS2551: Property 'openManualSignup' does not exist on type 'SignupComponent'
```

**Causa:** Templates HTML ainda referenciavam métodos OAuth e helpers do `fanti-up` que foram removidos do component.

**Solução:** Reescrever o template de signup para um form direto sem botões OAuth. Remover `signupWithGoogle`, `signupWithMicrosoft`, `signupWithApple`, `openManualSignup` do HTML e do `.ts`.

---

## 5. Duplicate identifier 'ReturnType' / Symbol.asyncDispose errors

**Sintoma:**
```
error TS2300: Duplicate identifier 'ReturnType'
error TS2339: Property 'asyncDispose' does not exist on type 'SymbolConstructor'
error TS1128: Declaration or statement expected  (node_modules/@types/node/ffi.d.ts)
```

**Causa:** `@types/node` instalado como dependência transitiva em versão 22+, que usa sintaxe TypeScript 5.0 (`const T extends` em generics). O Angular 15 usa TypeScript 4.8 e não consegue parsear essa sintaxe — `skipLibCheck` não resolve pois é erro de parse, não de tipo.

**Solução:** Fixar `@types/node` em v18 no `package.json`:
```json
"devDependencies": {
  "@types/node": "^18.19.0"
}
```
Depois rodar `npm install`.

Adicionalmente, incluir em `tsconfig.json` e `tsconfig.app.json`:
```json
"skipLibCheck": true
```

---

## 6. WorkspaceService / PermissionsService / AbilityService — referências quebradas

**Sintoma:**
```
error TS2307: Cannot find module '../services/workspace.service'
```

**Causa:** `workspace.service.ts` foi deletado (sem orgs no Finanti). Vários componentes e serviços do `fanti-up` dependiam dele.

**Solução:**
- `WorkspaceService` → deletado, remover todos os imports
- `PermissionsService` → reescrito como stub (sempre retorna `true`)
- `AbilityService` + `app-ability.ts` → reescritos como stubs (manage all)
- Componentes pesados (`account-settings`, `settings`, `billing`, `pricing`, `auth-callback`) → substituídos por stubs mínimos

---

## 7. CoreModule — HomeComponent / BastidoresComponent não existem

**Sintoma:**
```
error TS2307: Cannot find module './components/home/home.component'
```

**Causa:** `CoreModule` importava `HomeComponent`, `BastidoresComponent` e `PricingComponent` que foram removidos (sem landing page no Finanti).

**Solução:** Limpar o `CoreModule` removendo todas as declarations e exports dessas classes. O módulo fica vazio por enquanto.
