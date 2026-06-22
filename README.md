# Fisioterapia App

Scaffolding inicial para una app web fullstack de fisioterapia musculoesquelética.

## Stack
- Frontend: Next.js + TypeScript + Tailwind + ShadCN-ready
- Backend: Express + TypeScript + Prisma
- Base de datos: PostgreSQL con Docker Compose

## Estructura
```text
.
├── apps
│   ├── backend
│   └── frontend
├── context.md
├── docker-compose.yml
└── package.json
```

## Primeros pasos
1. Instalar dependencias en la raíz: `npm install`
2. Levantar PostgreSQL: `npm run db:up`
3. Copiar variables de entorno:
   - `apps/frontend/.env.example` -> `apps/frontend/.env.local`
   - `apps/backend/.env.example` -> `apps/backend/.env`
4. Iniciar frontend: `npm run dev:frontend`
5. Iniciar backend: `npm run dev:backend`

## Scripts principales
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run db:up`
- `npm run db:down`

## Nota
Este repositorio solo incluye scaffolding inicial. Todavía no implementa funcionalidades clínicas, autenticación ni módulos del MVP.
