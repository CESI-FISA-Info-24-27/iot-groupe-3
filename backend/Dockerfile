# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (y compris dev pour TypeScript)
RUN npm ci

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier les fichiers compilés depuis le builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
