# Simplified Dockerfile - Sử dụng build artifacts có sẵn
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (includes server.js, node_modules, public, etc.)
COPY --chown=nextjs:nodejs .next/standalone ./

# Copy static assets (client-side JS/CSS)
COPY --chown=nextjs:nodejs .next/static ./.next/static

# Create logs directory
RUN mkdir -p logs && chown nextjs:nodejs logs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]