
FROM node:20-alpine AS build
WORKDIR /app

# Copy only manifest first to leverage Docker layer cache
COPY package.json package-lock.json* .npmrc* ./

# Force dev dependencies installation even if NODE_ENV is set elsewhere
RUN npm install --no-audit --no-fund --production=false \
	&& npm cache clean --force

# Copy the rest of the source (node_modules excluded by .dockerignore)
COPY . .

# Build-time API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Run build using local vite binary from node_modules/.bin (no need for global install)
RUN npm run build

FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

# Provide custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]