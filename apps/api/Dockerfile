# Multi-stage build for NestJS API with Prisma and SQLite

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
# Build the NestJS application (dist/)
RUN npm run build

FROM node:20-alpine AS prod
ENV NODE_ENV=production

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app and necessary assets
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY config ./config

# Generate Prisma client for runtime
RUN npx prisma generate

# Create necessary runtime directories (mounted by compose in runtime)
RUN mkdir -p /app/logs /app/prisma/data

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"]
