# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./

# Copy workspace packages
COPY backend/api/package*.json ./backend/api/
COPY frontend/web/package*.json ./frontend/web/

# Install dependencies
RUN npm ci --include=dev --workspaces --include-workspace-root

# Copy source code
COPY . .

# Build backend API
RUN npm run build -w api

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY backend/api/package*.json ./backend/api/
COPY frontend/web/package*.json ./frontend/web/

# Install production dependencies only
RUN npm ci --workspaces --include-workspace-root --omit=dev

# Copy built application from builder
COPY --from=builder /app/backend/api/dist ./backend/api/dist
COPY --from=builder /app/backend/api/prisma ./backend/api/prisma

# Set working directory to API
WORKDIR /app/backend/api

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
