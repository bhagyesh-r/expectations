# Deployment

This project ships with a GitHub Actions pipeline that verifies the monorepo, builds Docker images, pushes them to GitHub Container Registry, and deploys them to an existing EC2 instance with Docker installed.

## AWS Agent Toolkit

For future AWS infrastructure changes, install the AWS Agent Toolkit for AWS in Codex:

```bash
codex plugin marketplace add aws/agent-toolkit-for-aws
```

Then install `aws-core` from `/plugins`. The toolkit provides current AWS guidance, documentation access, and MCP-backed AWS operations. Reference: https://github.com/aws/agent-toolkit-for-aws

## GitHub Secrets

Add these repository secrets:

- `EC2_HOST`: public DNS name or IP of the EC2 instance
- `EC2_USER`: SSH user, for example `ubuntu` or `ec2-user`
- `EC2_SSH_KEY`: private key with SSH access to the EC2 instance

## Create And Push The GitHub Repo

From this project directory:

```bash
git init
git add .
git commit -m "feat: scaffold expectations mvp"
git branch -M main
git remote add origin git@github.com:<your-user-or-org>/<your-repo>.git
git push -u origin main
```

Create the empty GitHub repository first in the GitHub UI. Do not initialize it with a README because this project already has one.

## GitHub Repository Settings

In GitHub:

1. Open the repository.
2. Go to **Settings > Actions > General**.
3. Under **Workflow permissions**, choose **Read and write permissions**.
4. Enable **Allow GitHub Actions to create and approve pull requests** only if you want automation to open PRs later.
5. Go to **Settings > Secrets and variables > Actions**.
6. Add the secrets listed below.

### Required GitHub Secrets

`EC2_HOST`

Public IP or DNS name for the EC2 instance.

Example:

```text
13.201.10.20
```

`EC2_USER`

The SSH username for the AMI.

Common values:

```text
ubuntu
```

or:

```text
ec2-user
```

`EC2_SSH_KEY`

The full private key used to SSH into the EC2 instance.

Example shape:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Keep this private. Do not commit it.

## EC2 Setup

SSH into the EC2 instance:

```bash
ssh -i /path/to/key.pem ubuntu@<EC2_HOST>
```

Install Docker Compose plugin if it is not already installed:

```bash
docker compose version
```

If that command fails, install Docker Compose using the Docker docs for your AMI.

Create the app directory:

```bash
sudo mkdir -p /opt/expectations
sudo chown -R "$USER":"$USER" /opt/expectations
```

Create `/opt/expectations/.env`:

```bash
cat > /opt/expectations/.env <<'EOF'
POSTGRES_USER=expectations
POSTGRES_PASSWORD=replace-with-a-strong-db-password
POSTGRES_DB=expectations
DATABASE_URL=postgresql://expectations:replace-with-a-strong-db-password@postgres:5432/expectations?schema=public
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
CORS_ORIGIN=http://<EC2_HOST>
API_PORT=4000
WEB_PORT=80
API_IMAGE=ghcr.io/<your-user-or-org>/<your-repo>/api:latest
WEB_IMAGE=ghcr.io/<your-user-or-org>/<your-repo>/web:latest
EOF
```

Replace:

- `<EC2_HOST>` with the EC2 public IP or DNS name.
- `<your-user-or-org>` with your GitHub owner.
- `<your-repo>` with your GitHub repository name.
- both database password values with the same strong password.
- `JWT_SECRET` with a long random value.

Generate a JWT secret locally with:

```bash
openssl rand -base64 48
```

Security group inbound rules should allow:

- TCP `22` from your IP for SSH.
- TCP `80` from the internet or your IP for the web app.
  The production web container proxies `/api` to the API container. The API does not need to be exposed publicly by default.

## GitHub Container Registry Access

The workflow pushes images to GitHub Container Registry using `GITHUB_TOKEN`. On the EC2 instance, Docker may need to authenticate before it can pull private images.

If your repository or packages are private, create a GitHub personal access token with package read permission, then run this on EC2:

```bash
echo "<github-token>" | docker login ghcr.io -u <github-username> --password-stdin
```

If the repository and packages are public, this step may not be required.

## First Deploy

Push to `main` to trigger the workflow:

```bash
git push origin main
```

The workflow will:

1. Install dependencies.
2. Generate Prisma client.
3. Validate Prisma schema.
4. Run linting and formatting checks.
5. Build API and web apps.
6. Run Jest backend tests and Playwright frontend E2E tests.
7. Build Docker images.
8. Push images to GHCR.
9. SSH into EC2 and run Docker Compose.

If `/opt/expectations/.env` does not exist, the workflow creates a template and exits. Fill in the real values, then rerun the workflow.

If you already created `/opt/expectations/.env`, the deploy should pull the latest images and start:

- `postgres`
- `api`
- `web`

## EC2 Operations

Check containers:

```bash
cd /opt/expectations
docker compose --env-file .env -f docker-compose.prod.yml ps
```

View logs:

```bash
docker compose --env-file .env -f docker-compose.prod.yml logs -f api
docker compose --env-file .env -f docker-compose.prod.yml logs -f web
docker compose --env-file .env -f docker-compose.prod.yml logs -f postgres
```

Restart:

```bash
docker compose --env-file .env -f docker-compose.prod.yml restart
```

Stop:

```bash
docker compose --env-file .env -f docker-compose.prod.yml down
```

Do not run `docker compose down -v` on production unless you intentionally want to delete the database volume.

## Runtime

Production uses `docker-compose.prod.yml`:

- `postgres`: persistent PostgreSQL volume
- `api`: Node.js API, runs `prisma migrate deploy`, listens on port 4000
- `web`: Nginx static React PWA, listens on port 80 by default, and proxies `/api` to the API service
