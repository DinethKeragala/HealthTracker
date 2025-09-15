# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app

# Install deps separately (leverage caching)
COPY package.json package-lock.json* .npmrc* ./
RUN npm install --production --no-audit --no-fund && npm cache clean --force

# Copy source
COPY . .

# Expose port
EXPOSE 5000

# Default env
ENV NODE_ENV=production

# Start command
CMD ["node", "server.js"]
