# Consulta de Riesgo Financiero

Desafío técnico (MVP demo). Backend Node/TS + frontend React/TS. JWT con roles `admin` / `user`.

## Setup

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
cp backend/.env.example backend/.env   # solo si no tienes .env
cp frontend/.env.example frontend/.env
npm run dev
```

- API: `http://localhost:3001`
- SPA: `http://localhost:5173`
- Tests: `npm test`
- Variables: ver `backend/.env.example` y `frontend/.env.example`

## Credenciales (demo)

| Email | Password | Rol | RUT |
|-------|----------|-----|-----|
| `admin@demo.com` | `admin123` | admin | cualquier RUT |
| `user@demo.com` | `user123` | user | solo `12.345.678-9` |

## API (resumen)

```bash
# Login
curl -s -X POST http://localhost:3001/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@demo.com","password":"admin123"}'

# Score (Bearer JWT)
curl -s "http://localhost:3001/score/12.345.678-9" \
  -H "Authorization: Bearer <token>"
```

- `POST /login` → `{ token }`. Tras 3 fallos: `429` (bloqueo temporal).
- `GET /score/:rut` → `{ rut, score, fecha }`. Score 0–100 determinístico. Auth JWT; `user` solo su RUT (validado en servidor).

En UI: `user` ve RUT fijo + Consultar; `admin` ingresa RUT. Cliente HTTP: Axios.

## Tests

Backend automatizado en `backend/tests/` (`npm test`): login, lockout, JWT, RBAC, RUT, score.

## Transparencia de uso de IA

Trabajé con **Cursor** (agente de código) como apoyo, no como reemplazo de la revisión.

### Qué hice yo

- Armé el **plan de desarrollo con apoyo de IA** y lo **fui iterando**: alcances, casos de prueba, lockout, UX del RUT fijo, seguridad, pausas por etapa, etc.
- Impuse la regla de **no avanzar de etapa sin mi aprobación** (y commits por avance).
- Revisé cada entrega (scaffold → auth/lockout → score/RBAC → frontend auth → score UI → README).
- Tomé o confirmé decisiones de producto y seguridad en esas iteraciones, por ejemplo:
  - RUT fijo en UI para `user`, con validación igual en backend
  - Lockout de login (3 intentos)
  - Preferencia por Axios frente a `fetch`
  - Ajustes de UX, README y dudas de riesgos (XSS, RUT en pantalla, etc.)
- Validé comportamiento a mano (login, roles, consulta) antes de dar por cerrada cada etapa.

### Qué hizo la IA

- Borradores del plan, arquitectura y matriz de tests (que yo revisé e iteré)
- Implementación del código y tests bajo las etapas acordadas
- Redacción/base del README (luego ajustada con mi criterio)

La entrega final es responsabilidad mía: la IA ayudó a planificar e implementar; la iteración del plan, la revisión y la aceptación por etapa fueron humanas.
