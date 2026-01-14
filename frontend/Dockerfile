# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste du code
COPY . .

# Construire l'application Angular en mode production
RUN npm run build -- --configuration production

# Production stage avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés depuis le dossier de sortie Angular (www selon angular.json)
COPY --from=build /app/www /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permettre à nginx d'écouter sur le port 8082
RUN sed -i 's/listen\s*80;/listen 8082;/' /etc/nginx/conf.d/default.conf || true

EXPOSE 8082
CMD ["nginx", "-g", "daemon off;"]
