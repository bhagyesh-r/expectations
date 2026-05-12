FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci --workspace apps/api --legacy-peer-deps
RUN npx prisma generate --schema apps/api/prisma/schema.prisma
WORKDIR /app/apps/api
COPY apps/api ./

FROM base AS development
ENV NODE_ENV=development

FROM base AS build
RUN npm run build

FROM build AS production
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
