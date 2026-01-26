# Description

## Type de modification

Cochez les cases appropriées :

- [ ] 🐛 Bug fix (correction d'un problème)
- [ ] ✨ Nouvelle fonctionnalité (ajout de fonctionnalité)
- [ ] 🔧 Refactoring (amélioration du code sans changement fonctionnel)
- [ ] 📚 Documentation (mise à jour de la documentation)
- [ ] 🚀 Amélioration de performance
- [ ] 🧪 Tests (ajout ou modification de tests)
- [ ] 🔒 Sécurité (correction de vulnérabilité)

## Résumé des changements

<!-- Décrivez brièvement ce que fait cette PR -->

## Motivation et contexte

<!-- Pourquoi ce changement est-il nécessaire ? Quel problème résout-il ? -->
<!-- Si cela corrige une issue, ajoutez : Fixes #123 -->

## Comment a-t-elle été testée ?

<!-- Décrivez les tests que vous avez effectués -->

- [ ] Tests unitaires (si applicable)
- [ ] Tests d'intégration
- [ ] Tests manuels sur matériel réel
- [ ] Tests avec l'application mobile

**Configuration de test** :

- Matériel : <!-- Ex: Raspberry Pi 4 + ESP32 -->
- Environnement : <!-- Ex: Docker / Local -->

## Checklist avant merge

- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes du code
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests si applicable
- [ ] Tous les tests passent localement
- [ ] Le pipeline CI/CD passe (GitHub Actions)
- [ ] J'ai vérifié qu'il n'y a pas de credentials en clair dans le code
- [ ] Le fichier `.gitignore` est à jour si de nouveaux fichiers sont générés

## Captures d'écran (si applicable)

<!-- Ajoutez des captures d'écran pour illustrer les changements visuels -->

## Impacts sur les autres composants

<!-- Cette PR affecte-t-elle d'autres parties du système ? -->

- [ ] Backend API
- [ ] Gateway BLE-MQTT
- [ ] Firmware ESP32 Sense
- [ ] Firmware ESP32-CAM
- [ ] Application Mobile
- [ ] Base de données (schéma modifié)
- [ ] Configuration Docker

## Notes additionnelles

<!-- Informations supplémentaires pour les reviewers -->

## Pour les reviewers

### Points à vérifier

- [ ] Le code est clair et maintenable
- [ ] Pas de code en dur (hardcoded values)
- [ ] Gestion appropriée des erreurs
- [ ] Pas de fuite de mémoire potentielle
- [ ] Les commits ont des messages descriptifs
- [ ] La branche est à jour avec `main`

### Suggestions d'amélioration

<!-- Commentaires constructifs pour l'auteur -->
