# Multi-stage build for Next.js Frontend
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate runtime config before build
RUN npm run generate-config

# Build Next.js application
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./

# Generate config at container startup
COPY --from=builder /app/scripts/generate-config.js ./scripts/

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Generate config and start server
CMD ["sh", "-c", "node scripts/generate-config.js && node server.js"]
