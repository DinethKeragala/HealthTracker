
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
RUN npm install --no-audit --no-fund --production=false && npm cache clean --force

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]