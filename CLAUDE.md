# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start full stack (Docker)
npm run dev

# Stop
docker compose down

# Reset database volume
docker compose down -v

# Local dev without Docker (requires PostgreSQL at DATABASE_URL)
npm run dev:local

# Build both workspaces
npm run build

# Run all tests
npm test

# Lint both workspaces
npm run lint

# Format
npm run format        # write
npm run format:check  # check only

# API-specific
npm run prisma:migrate -w apps/api   # create migration
npm run prisma:generate -w apps/api  # regenerate Prisma client
npm run prisma:studio -w apps/api    # open Prisma Studio

# Run a single API test file
cd apps/api && node --experimental-vm-modules ../../node_modules/jest/bin/jest.js tests/check-in-summary.test.ts

# Run web E2E tests
npm run test -w apps/web
```

After `npm install`, always run `npm run prisma:generate -w apps/api` before building or testing — the generated Prisma client is required.

## Architecture

This is a TypeScript monorepo with two workspaces: `apps/api` and `apps/web`.

### API (`apps/api`)

Express app assembled in `src/app.ts`, started in `src/server.ts`. All routes are prefixed `/api/*`.

**Module layout** — each domain folder under `src/modules/` contains a single `*.routes.ts` file that owns its Zod validation, Prisma queries, and business logic inline:

| Module             | Routes                                                |
| ------------------ | ----------------------------------------------------- |
| `auth`             | `/api/auth` — signup, login, me                       |
| `couple-spaces`    | `/api/couple-spaces` — create, join                   |
| `expectation-sets` | `/api/expectation-sets` — CRUD + duplicate            |
| `expectations`     | `/api/expectations` — create, patch                   |
| `check-ins`        | `/api/check-ins` — load today's form, PUT to save     |
| `dashboard`        | `/api/dashboard` — aggregated view + day details      |
| `reviews`          | `/api/reviews` — qualitative review summary           |
| `gamification`     | service only — called from check-in routes after save |

**Shared lib** (`src/lib/`):

- `auth.ts` — `requireAuth` middleware, `currentUser()` helper, `signToken()`
- `errors.ts` — `AppError(statusCode, message)` and global `errorHandler`
- `prisma.ts` — singleton Prisma client
- `env.ts` — validated env vars
- `dates.ts` — `toDateOnly()` used for normalising date strings

**Pattern**: routes call `requireAuth` at the router level, then `currentUser(request)` per handler. All DB operations go through `prisma` (the singleton). Business errors throw `AppError`; Zod parses request bodies. `express-async-errors` propagates thrown errors to the error handler automatically.

**Tests**: Jest in `apps/api/tests/`. Unit tests cover pure computation in `check-in-summary.ts` and `review-summary.ts`. Integration tests use `supertest` against the Express app.

### Web (`apps/web`)

Single-page React app. The entire UI lives in `src/App.tsx` — no router library; navigation is state-driven via a `View` union type (`"dashboard" | "sets" | "checkin" | "calendar" | "review"`).

- `src/api/client.ts` — typed `fetch` wrapper; token stored in `localStorage` under `expectations_token`; `VITE_API_URL` env var overrides the default `http://localhost:4000/api`
- `src/api/types.ts` — shared TypeScript types matching API response shapes
- `src/components/` — `Button`, `Field`, `InitialAvatar` (small reusable primitives)

**Tests**: Playwright E2E in `apps/web/tests/e2e/`. Tests mock API responses; no real database required.

### Data model key points

- Each `Expectation` has a `createdByUserId` (who set it) and `expectedFromUserId` (who must fulfil it).
- `DailyExpectationStatus` is unique per `(expectationId, markedByUserId, date)` — upserted on every check-in save.
- `AppreciationNote` is unique per `(expectationSetId, createdByUserId, date)`.
- Soft-delete on expectations (`isActive: false`) rather than hard delete.
- Dates are stored as `DateTime` in Prisma but treated as date-only values; always use `toDateOnly()` to normalise input strings.

### Docker

- `docker-compose.yml` — local dev: `postgres`, `api` (tsx watch), `web` (Vite)
- `docker-compose.prod.yml` — production: `postgres`, `api` (node dist), `web` (Nginx serving static + proxying `/api` to `api:4000`)
- CI/CD via `.github/workflows/ci-cd.yml` builds and pushes Docker images to GHCR, then deploys to EC2 via SSH
