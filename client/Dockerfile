
FROM node:20-alpine AS build
WORKDIR /app

# Force development mode so devDependencies (vite, plugin-react, tailwind, etc.) are installed.
ENV NODE_ENV=development

COPY package.json package-lock.json* ./

# Install dependencies (dev included). Use npm install rather than npm ci if lockfile absent.
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi \
	&& npm cache clean --force \
	&& ls -1 node_modules/.bin | grep -i vite || (echo "Vite not installed" && exit 1)

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build using local vite binary (explicit path for clarity)
RUN node_modules/.bin/vite build

FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
