# Architecture

## Overview

Expectations is a dockerized full-stack TypeScript monorepo.

- `apps/web`: React TypeScript mobile-first PWA.
- `apps/api`: Node.js TypeScript API.
- `apps/api/prisma`: Prisma schema and migrations.
- `docker-compose.yml`: local development stack.
- `docker-compose.prod.yml`: EC2 production stack.
- `.github/workflows/ci-cd.yml`: CI/CD pipeline.

## Technology Stack

### Frontend

- React 18 for UI.
- TypeScript for static typing.
- Vite for local development and production builds.
- Vite PWA plugin for manifest/service worker generation.
- Lucide React for icons.
- Playwright for frontend E2E tests.
- Nginx for serving the production static app and proxying `/api`.

### Backend

- Node.js 20.
- Express for HTTP routing.
- TypeScript for API code.
- Prisma ORM for database access and migrations.
- PostgreSQL for persistence.
- Zod for request validation.
- bcryptjs for password hashing.
- jsonwebtoken for JWT sessions.
- Jest for backend unit tests.

### DevOps

- Docker Compose for local and production orchestration.
- PostgreSQL 16 Alpine container.
- GitHub Actions for CI/CD.
- GitHub Container Registry for Docker images.
- EC2 as the production Docker host.
- AWS Agent Toolkit reference for future AWS-aware automation and infrastructure work.

### Code Quality

- ESLint for TypeScript and React linting.
- Prettier for formatting.
- Root scripts run checks across both workspaces:
  - `npm run lint`
  - `npm run format:check`
  - `npm run build`
  - `npm test`

## Backend Module Layout

The API is organized by product domain:

- `auth`: sign-up, login, current-user session.
- `couple-spaces`: create/join couple space.
- `expectation-sets`: list, create, duplicate sets.
- `expectations`: add, edit, soft-delete expectations.
- `check-ins`: daily status and appreciation-note save/read.
- `dashboard`: active-set dashboard, calendar preview, day details.
- `reviews`: qualitative review summary.
- `gamification`: badge awarding rules.
- `lib`: environment, auth middleware, Prisma client, date helpers, errors.

## Data Model

Primary tables:

- `User`
- `CoupleSpace`
- `ExpectationSet`
- `Expectation`
- `DailyExpectationStatus`
- `AppreciationNote`
- `Badge`

Important constraints:

- Unique user email.
- Unique couple code.
- Unique daily status per expectation, marker, and date.
- Unique appreciation note per expectation set, user, and date.
- Unique badge per couple/user/badge type.

## Runtime Flow

1. User signs up or logs in.
2. API returns a JWT.
3. Frontend stores the JWT and sends it as a bearer token.
4. User creates or joins a couple space.
5. Partners create expectation sets and expectations.
6. Daily check-ins save statuses and optional appreciation notes.
7. Dashboard and review endpoints aggregate status, appreciation, calendar, and badge data.

## Local Docker Architecture

`npm run dev` runs:

- `postgres`: PostgreSQL database.
- `api`: Express API with Prisma generate/db push and `tsx watch`.
- `web`: Vite dev server.

Local URLs:

- Web: `http://localhost:5173`
- API health: `http://localhost:4000/api/health`

## Production Docker Architecture

`docker-compose.prod.yml` runs:

- `postgres`: persistent PostgreSQL volume.
- `api`: Node.js API with `prisma migrate deploy`.
- `web`: Nginx static app.

The public entrypoint is the web container on port `80`. The web container proxies `/api` internally to `api:4000`, so the API does not need to be directly public.

## CI/CD Flow

On pull requests and pushes:

1. Checkout.
2. Install Node dependencies.
3. Generate Prisma client.
4. Validate Prisma schema.
5. Run ESLint.
6. Run Prettier check.
7. Build API and web apps.
8. Install Playwright browser.
9. Run Jest and Playwright tests.

On push to `main`:

1. Build production API and web Docker images.
2. Push images to GHCR.
3. Copy production Compose files to EC2.
4. SSH to EC2.
5. Pull images and restart the stack with Docker Compose.

## Known Limitations

- MVP uses JWT local storage; future hardening should consider httpOnly cookies.
- Couple-space max two-member enforcement is checked in application logic, not a database-level invariant.
- Playwright tests mock API responses for speed and determinism; full browser-plus-real-database tests can be added later.
- Push notifications, email verification, payment, and social features are intentionally out of MVP scope.
