# prueba-pronto-pago

Monorepo del MVP *Consulta de Riesgo Financiero*.

## Levantar todo

Desde la raíz del repo (requiere `npm install` una vez en raíz, `backend/` y `frontend/`):

```bash
npm run dev
```

Levanta backend (`:3001`) y frontend (`:5173`) a la vez.

## Estado

**Etapa 4 — Frontend auth** (en revisión): login, JWT en `localStorage`, rutas protegidas, mensajes de error/lockout (`429`). `/score` es placeholder; la consulta de score es Etapa 5.

Checklist manual UI-01..04: login OK, login fallido, cuenta bloqueada, `/score` sin token → redirect a `/login`.
