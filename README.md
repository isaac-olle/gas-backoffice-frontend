# gas-backoffice-frontend
Backoffice frontend repository

## CSRF

Terraform activa el CSRF a DigitalOcean amb `VITE_CSRF_ENABLED=true` en compilar.
Per activar-lo en local, configura el mateix valor a `.env`. Si el flag és absent
o és `false`, la integració queda desactivada. El backend ha de permetre
`X-CSRF-Token` a CORS per a l'origen del frontend.

El token del callback es desa només en memòria i s'envia a les peticions de
backoffice que modifiquen dades (incloent refresh i logout), amb cookies via
`credentials: 'include'`. No s'envia als GET ni al callback d'autenticació.
S'esborra en començar un nou login i en fer logout, encara que aquest falli.
No es desa en localStorage, sessionStorage ni cookies del frontend.

Després d'una recàrrega o en una pestanya nova, la primera operació que necessita
el token el recupera amb `GET /v1/backoffice/auth/csrf` i les cookies de sessió.
Les operacions concurrents comparteixen la recuperació. Si l'endpoint retorna un
401, el frontend torna a la pantalla de login.

## Events

La secció d'administració Events consumeix `GET /v1/backoffice/events` i mostra
tots els registres retornats, sense filtres ni límits al frontend. Aquest endpoint
encara s'ha d'implementar al backend local consultat.

El contracte esperat és un array JSON amb els camps `event_id`, `event_type`,
`aggregate_id`, `aggregate_type`, `author_id` (nullable), `author_role` (nullable),
`payload` (JSON) i `occurred_at` (data ISO 8601). El backend ha de restringir-ne
l'accés als administradors i retornar tots els events.
