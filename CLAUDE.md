# fisio-app — Contexto del proyecto

## Stack
- **Monorepo** con `apps/backend` y `apps/frontend`
- **Backend:** Express + TypeScript + Prisma + PostgreSQL (puerto 4000)
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + ShadCN (puerto 3000)
- **Auth:** JWT via cookie httpOnly (`token`), middleware en `require-auth.ts`
- **ORM:** Prisma — única capa de acceso a datos
- **Tests:** Jest + Supertest (backend), 59 tests verdes

## Estructura
```
apps/backend/src/
  modules/          → un módulo por dominio (auth, patients, sessions, etc.)
  middlewares/      → require-auth, error-handler, not-found-handler
  lib/              → jwt.ts, pagination.ts, async-handler.ts, http-error.ts
  test/             → tests de integración con mocks de Prisma

apps/frontend/src/
  app/              → rutas Next.js (App Router)
  components/       → componentes por dominio
  lib/              → api.ts (fetch base), patients-api.ts (endpoints), schemas.ts (Zod)
```

## Reglas del proyecto
- No borrado físico — usar soft delete (`deletedAt`)
- Validación con Zod en backend (siempre) y frontend (formularios principales)
- Separación estricta: routes → controller → service → Prisma
- Errores centralizados en `error-handler.ts` con clase `HttpError`
- Paginación con `lib/pagination.ts` — parámetros `?page` y `?limit`
- Todos los recursos verifican que pertenezcan al usuario autenticado

## Convenciones de código
- TypeScript estricto en ambas apps
- Nombres de archivos en kebab-case
- Async/await con `asyncHandler` wrapper en controllers
- Frontend: `credentials: "include"` en todos los fetch
- No usar `localStorage` para tokens — el JWT va en cookie httpOnly

## Base de datos
- PostgreSQL corriendo en Docker en puerto 5455
- Para migraciones: `cd apps/backend && npx prisma migrate dev --name <nombre>`
- Para regenerar cliente: `npx prisma generate`
- Seed: `npx tsx src/scripts/seed.ts`

## Comandos útiles
```bash
# Backend
cd apps/backend && npm run dev        # servidor en :4000
cd apps/backend && npm test           # correr tests

# Frontend
cd apps/frontend && npm run dev       # servidor en :3000

# Desde raíz
npm run dev --workspace=apps/backend
npm run dev --workspace=apps/frontend
```

## Lo que NO hacer
- No correr `prisma migrate` sin mostrar el SQL primero
- No instalar paquetes sin avisar qué y por qué
- No modificar archivos en `prisma/migrations/` manualmente
- No usar `document.write` ni `window.open` para generar PDFs
- No hardcodear IDs de usuario — siempre usar `req.user` del middleware
