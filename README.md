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

## Practice Arena (first fully-built feature)

The Practice Arena is implemented end-to-end as the reference for how each tab
should be built.

**Backend** (`src/controllers/practice.controller.ts`, `exam.controller.ts`)
- `GET  /api/practice/tests?category=&difficulty=` — light catalog (`select`, no answer keys)
- `GET  /api/practice/leaderboard` — top 5 users by points
- `GET  /api/practice/streak/:userId` — rolling 7-day activity array
- `GET  /api/practice/tests/:id` — full blueprint (sections/questions/options) **without** answer keys
- `POST /api/practice/autosave` — buffers one answer in Redis (`exam:${testId}:${userId}` hash), never touches Postgres
- `POST /api/practice/submit` — grades against Neon, writes one `TestSubmission` in a `$transaction`, updates points/streak, clears the Redis buffer
- Models added: `Test`, `Section`, `Question`, `TestSubmission` (+ enums).

**Frontend**
- `app/dashboard/practice-arena/page.tsx` — filter ribbon, recommended-tests grid,
  explore-by-type grid, and side widgets (Quick Actions, Test Streak, Leaderboard,
  Trending). SWR fetching; category filter is client-side.
- `app/dashboard/practice-arena/[testId]/page.tsx` — live test runner: countdown
  (auto-submits at 0), section tabs, question palette (colour-coded), MCQ + Monaco
  code editor (dynamic import, SSR off), auto-save debounced 2s.

## Run it

```bash
# Backend
cd backend
cp .env.example .env        # fill in Neon + Upstash + JWT values
npm install
npm run prisma:generate
     # needs network access to binaries.prisma.sh
npm run prisma:migrate      # create tables in Neon
npm run prisma:seed         # demo tests + leaderboard users (optional)
npm run dev                 # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

> The base runs without a real DB/Redis: login is mocked and the un-built API
> routes return `501 Not Implemented`. Configure `.env` before wiring real data.
> Auto-save/streak need an authenticated user id — the base reads a `uid` cookie
> (interns set this from real auth). Autosave degrades gracefully if Redis is off.

## For interns

Each sidebar tab maps to a folder under `frontend/app/dashboard/` and (eventually)
a controller/route under `backend/src/`. Replace the `TabPlaceholder` in a page
with the real UI, add the matching backend endpoint, then extend
`prisma/schema.prisma` with the models that tab needs. Keep to the design system
(indigo primary, `rounded-xl`, `shadow-sm`, `border-slate-100`) and the
optimization patterns (DB-level aggregates, `select`/pagination, SWR, Redis for
hot reads).
