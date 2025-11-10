# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app

# Install deps separately (leverage caching)
COPY package.json package-lock.json* .npmrc* ./
# Install ALL dependencies (including dev) because we need express, mongoose, etc.
RUN npm install --no-audit --no-fund --production=false && npm cache clean --force

# Copy source
COPY . .

# Expose port
EXPOSE 5000

# Default env
ENV NODE_ENV=production

# Start command (ensure dependencies exist)
CMD ["node", "server.js"]
