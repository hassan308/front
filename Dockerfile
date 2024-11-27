# Base stage
FROM node:18-alpine AS builder

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Clean npm cache and install necessary tools
RUN npm cache clean --force && \
    rm -rf /root/.npm/* && \
    rm -rf /tmp/* && \
    apk add --no-cache libc6-compat && \
    npm install -g npm@10.8.2

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Clean install dependencies
RUN rm -rf node_modules && \
    rm -rf .next && \
    rm -rf package-lock.json && \
    npm cache clean --force && \
    npm install

# Copy the rest of the application
COPY . .

# Clean and build
RUN rm -rf .next && \
    npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Upgrade npm in production stage too
RUN npm install -g npm@10.8.2

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/tsconfig.json ./

# Set the correct permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
