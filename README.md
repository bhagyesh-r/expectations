# Expectations

Mobile-first PWA for couples to define expectations, complete daily check-ins, add appreciation notes, and review consistency patterns.

## Stack

- Frontend: React, TypeScript, Vite, PWA manifest
- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL
- Runtime: Docker Compose

## Run

Start the full stack with one command:

```bash
npm run dev
```

This builds and starts the backend, frontend, and PostgreSQL database with Docker Compose.

- Web: http://localhost:5173
- API: http://localhost:4000/api/health

The command works without creating a `.env` file because `docker-compose.yml` has development defaults. To override credentials, ports, JWT secret, or API URL:

```bash
cp .env.example .env
npm run dev
```

Stop the stack with:

```bash
docker compose down
```

Reset the local database volume with:

```bash
docker compose down -v
```

## Tests And Build

```bash
npm install
npm run prisma:generate -w apps/api
npm run build
npm test
```

Backend tests use Jest. Frontend E2E tests use Playwright.

## Local Development Without Docker

```bash
npm install
npm run prisma:generate
npm run dev:local
```

The local API expects `DATABASE_URL` to point at a PostgreSQL instance.

## Production Deployment

See [docs/deployment.md](docs/deployment.md) for GitHub Actions, EC2 Docker Compose deployment, and AWS Agent Toolkit notes.

That document includes:

- how to create and push the GitHub repository
- GitHub Actions permissions and secrets
- EC2 setup commands
- production `.env` values
- GHCR Docker image access
- deploy, logs, restart, and stop commands

## Project Documentation

- [Feature Details](docs/features.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
