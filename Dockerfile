# Stage 1 — compile TypeScript and React
FROM node:22-alpine AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY src/ ./src/
COPY client/ ./client/
RUN npm run build

# Stage 2 — production-only node_modules (no devDependencies)
FROM node:22-alpine AS prod-deps

RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 3 — minimal distroless runtime (no shell, no package manager)
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

CMD ["dist/server.js"]
