# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production=false

# Copier le reste du code
COPY . .

# Build l'application Angular
RUN npm run build -- --configuration production

# Production stage avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés depuis le dossier de sortie Angular
COPY --from=build /app/dist/app/browser /usr/share/nginx/html

# Configuration Nginx pour Angular (gestion des routes)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
