
FROM node:20-alpine AS build
WORKDIR /app

# Ensure devDependencies are installed regardless of external env
ENV NPM_CONFIG_PRODUCTION=false

COPY package.json package-lock.json* .npmrc* ./

# Prefer clean, reproducible install; fall back to install if no lockfile
RUN npm ci --include=dev --no-audit --no-fund || npm install --include=dev --no-audit --no-fund \
	&& npm cache clean --force

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build using local vite binary in node_modules/.bin
RUN npm run build

FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
