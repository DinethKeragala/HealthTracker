
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./

RUN npm install --no-audit --no-fund --production=false \
	&& npm cache clean --force

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]