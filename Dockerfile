FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY fishposts/package*.json ./
RUN npm ci

# Copy source and build
COPY fishposts/ ./
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
