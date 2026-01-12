# Gateway BLE-MQTT Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Installation des dépendances Bluetooth
RUN apt-get update && apt-get install -y \
    bluez \
    bluetooth \
    libbluetooth-dev \
    libglib2.0-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Commande de lancement
CMD ["python", "app/main.py"]
