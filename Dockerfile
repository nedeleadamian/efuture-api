# --- Stage 1: Base (Shared Setup) ---
FROM node:24-alpine AS base
WORKDIR /usr/app
COPY package.json package-lock.json ./

# --- Stage 2: Dependencies (Prod Only) ---
FROM base AS prod_deps
RUN npm ci --omit=dev && npm cache clean --force

# --- Stage 3: Builder (Builds the App) ---
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 4: Production (Final Image) ---
FROM node:24-alpine AS runner

WORKDIR /usr/app
ENV NODE_ENV=production

COPY --from=prod_deps /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/scripts ./scripts

USER node

CMD ["sh", "scripts/start.sh"]