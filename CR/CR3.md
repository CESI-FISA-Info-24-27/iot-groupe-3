# Compte rendu de réunion – Semaine du 26 janvier 2026

## Ce que nous avons réalisé

- Fonctionnement du BLE validé
- Mise en place du serveur MQTT
- Mise en place du streaming caméra avec go2rtc
- Migration de la base de données de SQLite vers InfluxDB
- Migration du backend de FastAPI vers Express
- Mise à jour du pipeline CI/CD suite aux migrations
- Intégration des websockets dans l'architecture
- Amélioration visuelle du frontend

## Ce que nous prévoyons pour la semaine prochaine

- Développer un script Python pour transmettre les données des capteurs BLE au serveur MQTT
- Écrire un script pour remplir la base de données des mesures via l'API (POST)
- Ajouter un service dans le backend pour les calculs statistiques, l'anticipation de mesures et d'autres fonctionnalités du produit final
- Mettre en place des tests unitaires pour le backend et le frontend
- Câbler les capteurs qui ne sont pas encore connectés
- Améliorer le frontend avec l'affichage d'informations supplémentaires

## Changements de rôles dans l'équipe

- Loïc : passe de Embedded Lead à Mobile & UX Lead
- Trystan : passe de Edge Ops Lead à Backend Architect
- Xavier : passe de Backend Architect à Edge Ops Lead
- Nicolas : passe de Mobile & UX Lead à Embedded Lead
