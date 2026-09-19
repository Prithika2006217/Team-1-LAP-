# Tenzorce LAP — Base Application

Foundational scaffold for **Tenzorce**, an AI-powered Learning, Practice &
Assessment Platform. This is the **base only** — the runnable shell interns
build out tab-by-tab (UI → API → DB).

## Repos

```
LAP/
├── backend/    Node + Express + TypeScript API (Prisma / Neon / Upstash Redis)
└── frontend/   Next.js 14 App Router + Tailwind + shadcn/ui
```

## What's in the base

**Frontend**
- Root + dashboard layouts with a fixed **Sidebar** (Server Component) and **Header**.
- Multi-role **tabbed login** (Student / Trainer / TPO / Admin) with client-side
  validation and a mock JWT-cookie handler.
- Edge **middleware** protecting `/dashboard/*` and bouncing logged-in users off `/login`.
- One **placeholder page per sidebar tab** so navigation is fully clickable.
- Tenzorce design tokens (indigo primary, slate canvas) wired through Tailwind + CSS vars.

**Backend**
- Express server with `helmet`, dynamic `cors`, and a global rate limiter (100 req / 15 min / IP).
- Shared **Prisma** client + lazy **Redis** client.
- `prisma/schema.prisma` with the **User** model + `Role` enum and indexes.
- Placeholder routes: `POST /api/auth/login`, `GET /api/study/modules` (return 501).

## Run it

```bash
# Backend
cd backend
cp .env.example .env        # fill in Neon + Upstash + JWT values
npm install
npm run prisma:generate
npm run dev                 # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

> The base runs without a real DB/Redis: login is mocked and API routes return
> `501 Not Implemented`. Configure `.env` before wiring real data.

## For interns

Each sidebar tab maps to a folder under `frontend/app/dashboard/` and (eventually)
a controller/route under `backend/src/`. Replace the `TabPlaceholder` in a page
with the real UI, add the matching backend endpoint, then extend
`prisma/schema.prisma` with the models that tab needs. Keep to the design system
(indigo primary, `rounded-xl`, `shadow-sm`, `border-slate-100`) and the
optimization patterns (DB-level aggregates, `select`/pagination, SWR, Redis for
hot reads).
