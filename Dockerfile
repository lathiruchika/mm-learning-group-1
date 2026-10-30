# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest and build
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM nginx:alpine

# SPA nginx config (history mode fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
