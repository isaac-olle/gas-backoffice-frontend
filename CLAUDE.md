# CLAUDE.md

Guia del projecte per a Claude Code (i per a l'equip). Recull l'arquitectura,
les convencions i les decisions preses. Llegeix-ho abans de tocar codi.

## Què és

`gas-backoffice-frontend` — backoffice del **GAS (General Authorization Server)**.
SPA d'administració (tenants, clients, protected resources i scopes) construïda amb
arquitectura **modular per bounded context** inspirada en DDD.

## Stack

- **React 18** + **Vite 5** + **TypeScript**
- **Tailwind CSS** per als estils
- **lucide-react** per a les icones
- **`fetch`** contra un backend HTTP propi. Tots els repositoris ataquen aquest
  backend via el client HTTP transversal (`shared/infrastructure/http`). Ja no hi
  ha Supabase ni cap altre BaaS.

## ⚠️ Node

Vite 5 requereix **Node 18+**. El projecte s'ha desenvolupat amb **Node 22**.
Amb Node 16 no arrenca. Si uses `nvm`:

```bash
nvm use 22
```

## Scripts

```bash
npm install       # instal·lar dependències
npm run dev       # servidor de desenvolupament (http://localhost:5173)
npm run build     # build de producció
npm run preview   # previsualitzar el build
npm run lint      # eslint
npm run typecheck # tsc --noEmit (mantingues-ho net abans de commit)
```

## Variables d'entorn (`.env`)

Vite només exposa variables amb prefix `VITE_`.

- `VITE_API_BASE_URL` — base del backend propi (totes les crides HTTP i el login OAuth).

Tot accés a `import.meta.env` va centralitzat a `shared/infrastructure/http/httpClient.ts`
(mai escampat per components ni repositoris).

## Estructura

```
src/
  main.tsx                 ← composition root: instancia dependències i les injecta
  App.tsx                  ← arrel de UI (consumeix el context, ja no l'embolcalla)
  index.css

  pages/                   ← capa de presentació (transversal a tots els mòduls)
    *.tsx                  ← una pàgina per fitxer
    hooks/                 ← hooks de presentació / dades usats per les pàgines
    components/            ← icons/ · layout/ · modals/

  shared/
    infrastructure/
      http/httpClient.ts   ← client HTTP transversal; únic lloc que llegeix VITE_API_BASE_URL

  modules/                 ← un mòdul per bounded context
    <context>/
      <Context>.tsx        ← React Context al NIVELL del mòdul (fora d'application)
      domain/              ← model + interfície del repositori, JUNTS (sense subcarpetes)
        <Entity>.ts        ← model de domini
        I<Entity>Repository.ts  ← port (interfície)
      application/         ← casos d'ús (un per fitxer)
      infrastructure/
        repositories/      ← implementacions dels ports (crides al backend)
```

Mòduls actuals: `auth` (entitat: `User`). Els mòduls de negoci (`tenants`,
`clients`, `protected_resources`) es reintroduiran més endavant; ara mateix el
projecte és **només el flux de login**.

## Convencions

### Estructura de carpetes (regles)
- **Un mòdul per bounded context** sota `modules/<context>/`. Mòdul actual:
  `auth` (entitat `User`).
- Cada mòdul té **com a molt** tres capes: `domain/`, `application/`,
  `infrastructure/`. El **context** del mòdul viu a l'arrel del mòdul, **fora** de
  `application/` (p. ex. `modules/auth/AuthContext.tsx`).
- `pages/` és la **capa de presentació transversal**; no viu dins de cap mòdul.
- `shared/` conté infraestructura transversal (p. ex. el client HTTP). **Cap
  mòdul depèn d'un altre**; el que és comú va a `shared/`.
- Noms: mòduls i carpetes en `snake_case` (`protected_resources`); fitxers de
  classes/models/casos d'ús en `PascalCase`; hooks en `camelCase` amb prefix `use`.

### 1. `domain/` pla
El model i la interfície del repositori van **directament** sota `domain/`, sense
subcarpetes `models/` ni `repositories/`. La interfície importa el model com a germà:
`import { User } from './User'`.

### 2. Casos d'ús = funcions (no classes)
Cada cas d'ús és una **funció** que rep el repositori (per la seva interfície) com a
primer paràmetre i un DTO d'entrada com a segon. Orquestra i delega a la infraestructura.

```ts
// modules/auth/application/SignInWithIdp.ts
import { IAuthRepository } from '../domain/IAuthRepository';

export interface SignInWithIdpInput {
  idpId: string;
}

export function signInWithIdp(
  authRepository: IAuthRepository,
  input: SignInWithIdpInput
): void {
  authRepository.signInWithIdp(input.idpId);
}
```

### 3. El Context com a façana de casos d'ús
El Context viu al nivell del mòdul (`modules/<ctx>/<Ctx>.tsx`), rep el repositori
**injectat per props** (tipat com la interfície) i exposa un **diccionari `useCases`**
amb les funcions ja lligades al repositori. Els components no coneixen mai la
implementació concreta.

```ts
const useCases = useMemo(() => ({
  signInWithIdp: (input) => signInWithIdp(authRepository, input),
  signOut: () => signOut(authRepository),
  // ...
}), [authRepository]);
```

Ús des d'un component:

```ts
const { user, useCases } = useAuth();
useCases.signInWithIdp({ idpId: 'google' });
```

### 4. Injecció de dependències al `main` (composition root)
Les implementacions concretes s'instancien **només a `main.tsx`** i s'injecten al
provider. Cap capa d'aplicació/domini coneix la classe concreta.

```tsx
// main.tsx
const authRepository = new AuthRepository();
createRoot(...).render(
  <StrictMode>
    <AuthProvider authRepository={authRepository}>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

### 5. Injecció de dependències (resum de regles)
- Les **implementacions concretes** (repositoris) s'instancien **només a `main.tsx`**.
- Es passen al provider del mòdul **per props**, tipades sempre com la **interfície**
  (`IAuthRepository`), mai com la classe concreta.
- Els casos d'ús reben el repositori com a **paràmetre**; el context els el lliga.
- Cap fitxer de `domain/`, `application/` ni cap component fa `new XRepository()`.
  Si veus un `new` d'infraestructura fora de `main.tsx`, està mal col·locat.

### 6. Contexts
- **Un context per mòdul/agregat**, no per pantalla ni per acció (mai un `LoginContext`
  separat: el login és una acció dins de l'agregat auth).
- Viu a l'arrel del mòdul: `modules/<ctx>/<Ctx>Context.tsx`.
- Exposa: l'**estat** de l'agregat (p. ex. `user`, `loading`) + el **diccionari
  `useCases`** amb les operacions. Res més.
- Rep les dependències per props (DI) i construeix `useCases` amb `useMemo`
  (memoïtzat per la referència del repositori).
- Exporta un hook `use<Ctx>()` que valida que s'usa dins del provider.

### 7. Hooks
- Viuen a `pages/hooks/` (hooks de presentació/dades que consumeixen els mòduls).
- **Regles dels hooks de React sempre**: només al top-level d'un component o d'un
  altre hook. **Mai** dins de callbacks, condicions o bucles (això va causar un bug
  real amb `useScopes` cridat dins d'un `onAdd`).
- Un hook encapsula estat + efectes d'una preocupació concreta i retorna dades +
  accions; no barreja responsabilitats de mòduls diferents.

### 8. Components
- Viuen a `pages/components/`, organitzats per tipus: `icons/`, `layout/`, `modals/`.
- **Presentació pura**: reben dades i callbacks per props. No instancien
  infraestructura ni contenen lògica de negoci.
- Accedeixen a l'estat/accions de l'agregat via el hook del context (`useAuth()`),
  mai tocant repositoris directament.

### 9. Pages
- Una **pàgina per fitxer** a `pages/`, en `PascalCase` acabat en `Page`
  (`LoginPage.tsx`).
- Componen hooks + components per construir una vista completa.
- **No filtren dades per rol/tenant al client**: l'scoping el fa el backend; la
  pàgina mostra el que retorna l'API.
- Deleguen tota operació de negoci als `useCases` del context corresponent.

### Regla de dependències (global)
`pages` → `modules/*/application` → `modules/*/domain`.
La infraestructura implementa els ports del domini. `shared/` no depèn de cap mòdul,
i cap mòdul depèn d'un altre.

## Autenticació

- El login és **només basat en IdP** ("Login with Google"). Hi ha **una sola** operació
  de sign-in: el botó crida `useCases.signIn({ idpId: 'google' })`, que redirigeix a
  `${VITE_API_BASE_URL}/login/:idp_id` (p. ex. `/login/google`).
- **Patró BFF**: el backend és l'únic client OIDC. Executa **tot** el flux (genera
  `state`/`nonce`/`code_verifier`, fa el `/authorize` contra l'IdP, bescanvia el `code`
  per tokens i **els guarda al servidor**). Al navegador **només** hi arriba una cookie
  de sessió `HttpOnly`; el frontend no toca mai tokens, PKCE ni `sessionStorage`.
  `/login/:idp_id` és un endpoint propi del BFF, **no** el `/authorize` del protocol.
- No hi ha login amb email/password.
- Tots els repositoris (auth inclòs) són **clients HTTP** contra `VITE_API_BASE_URL`,
  via `shared/infrastructure/http/httpClient.ts`. La sessió la manté el backend amb
  **cookie** (el client HTTP envia `credentials: 'include'`).
- Endpoints d'auth: redirecció de login `GET /login/:idp_id` (sign-in),
  `GET /auth/me` (usuari actual) i `POST /auth/logout`.
- `onAuthStateChange` és un **no-op** (no hi ha canal de canvis en temps real): l'estat
  inicial es resol amb `getCurrentUser()`.
- Convenció de dades: el backend parla **snake_case** i cada repositori mapeja a
  camelCase amb un DTO + funció `to<Entity>`. Si el backend acaba parlant camelCase,
  només cal tocar aquests mapejadors.

## Model `User` (en transició)

```ts
export type UserRole = 'admin' | 'tenant';
export interface User {
  id: string;
  email: string;
  role: UserRole;
  adminId?: string;
}
```

- S'ha eliminat el rol `protected_resource` i els camps `tenantId` /
  `protectedResourceId`.
- L'**scoping de dades el fa el backend**: el frontend ja no filtra clients ni
  recursos per tenant/rol; mostra el que retorna l'API.
- ⚠️ El camp `admin_id` pot no venir encara del backend; `adminId` sortirà `undefined`
  fins que l'API el proporcioni. El mapeig (`admin_id` → `adminId`) ja hi és a punt.

## Notes de treball

- Mantén `npm run typecheck` net abans de fer commit.
- Arrenca la sessió de Claude Code des de l'arrel del projecte
  (`cd ~/GolandProjects/gas-backoffice-frontend && claude`) per evitar prompts de
  permisos contínues.
