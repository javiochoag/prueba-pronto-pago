# prueba-pronto-pago

Monorepo del MVP *Consulta de Riesgo Financiero*.

## Levantar todo

```bash
npm install          # raíz
npm install --prefix backend
npm install --prefix frontend
npm run dev          # backend :3001 + frontend :5173
```

## Estado

**Etapa 5 — Frontend score** (en revisión):

- Rol `user`: RUT fijo (sin input) + botón Consultar
- Rol `admin`: input de RUT + Consultar
- Muestra score y fecha; errores 400/403/401; logout limpia token

Checklist manual UI-05..09 pendiente de tu validación. README final = Etapa 6.
