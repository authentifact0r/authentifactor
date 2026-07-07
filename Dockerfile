FROM node:22-alpine AS deps
WORKDIR /app
# python3 + make + g++ needed for native deps (better-sqlite3 et al.)
# that npm rebuilds from source when no prebuilt alpine binary exists.
RUN apk add --no-cache libc6-compat openssl python3 make g++
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# `npm install` (not `npm ci`) — tolerates lockfile drift, important
# during the 2026-05-24 @vercel/blob → @google-cloud/storage swap.
# Revisit once lockfile is fully stable.
RUN npm install --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
# NEXT_PUBLIC_* are inlined into the client bundle at build time. They are
# browser-exposed public values (app URL + Stripe *publishable* key), passed
# from cloudbuild.yaml — .env.production is untracked and absent in CI checkouts.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 8080
CMD ["node", "server.js"]
