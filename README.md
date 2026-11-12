# gas-backoffice-frontend
Backoffice frontend repository

## Events

La secció d'administració Events consumeix `GET /v1/backoffice/events` i mostra
tots els registres retornats, sense filtres ni límits al frontend. Aquest endpoint
encara s'ha d'implementar al backend local consultat.

El contracte esperat és un array JSON amb els camps `event_id`, `event_type`,
`aggregate_id`, `aggregate_type`, `author_id` (nullable), `author_role` (nullable),
`payload` (JSON) i `occurred_at` (data ISO 8601). El backend ha de restringir-ne
l'accés als administradors i retornar tots els events.
