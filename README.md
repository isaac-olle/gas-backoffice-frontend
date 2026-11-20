# gas-backoffice-frontend
Backoffice frontend repository

## CSRF (pendent d'activar)

La integració està desactivada per defecte. `VITE_CSRF_ENABLED=true` l'habilita
en compilar; no s'ha de configurar fins que el backend retorni `csrf_token` al
callback, permeti `X-CSRF-Token` a CORS i validi el token.

El token del callback es desa només en memòria i s'envia a les peticions de
backoffice que modifiquen dades (incloent refresh i logout), amb cookies via
`credentials: 'include'`. No s'envia als GET ni al callback d'autenticació.
S'esborra en començar un nou login i en fer logout, encara que aquest falli.
No es desa en localStorage, sessionStorage ni cookies del frontend.

Una recàrrega perd el token. La recuperació queda pendent de definir amb el
backend; actualment no s'inventa cap endpoint ni es recupera des de `/users/me`.

## Events

La secció d'administració Events consumeix `GET /v1/backoffice/events` i mostra
tots els registres retornats, sense filtres ni límits al frontend. Aquest endpoint
encara s'ha d'implementar al backend local consultat.

El contracte esperat és un array JSON amb els camps `event_id`, `event_type`,
`aggregate_id`, `aggregate_type`, `author_id` (nullable), `author_role` (nullable),
`payload` (JSON) i `occurred_at` (data ISO 8601). El backend ha de restringir-ne
l'accés als administradors i retornar tots els events.
