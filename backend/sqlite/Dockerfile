FROM python:3.9-slim

WORKDIR /data

RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Copier une base existante
# COPY ecoguard.db .

VOLUME ["/data"]

CMD ["sqlite3"]