#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/expectations}"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "Missing ${APP_DIR}/.env on the EC2 host."
  exit 1
fi

cd "${APP_DIR}"
docker compose --env-file .env -f "${COMPOSE_FILE}" pull
docker compose --env-file .env -f "${COMPOSE_FILE}" up -d --remove-orphans
docker image prune -f
