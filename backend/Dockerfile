# Backend API Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Installation des dépendances système si nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire pour la base de données SQLite
RUN mkdir -p /app/data

# Copie des requirements (à créer par l'architecte backend)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Exposition du port API
EXPOSE 8000

# Commande de lancement avec FastAPI/Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
