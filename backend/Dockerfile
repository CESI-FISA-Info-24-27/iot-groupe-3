# Backend API Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Installation des dépendances système si nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copie des requirements (à créer par l'architecte backend)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Exposition du port API
EXPOSE 8000

# Commande de lancement (à adapter selon le framework choisi)
# Pour FastAPI/Uvicorn :
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
# Pour Flask :
# CMD ["python", "src/main.py"]
