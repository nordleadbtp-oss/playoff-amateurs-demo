# Documentation — PlayOff Amateurs (Sprint 4 Prototype)

## Intention de la démo

Ce prototype a pour objectif de valider la faisabilité du concept PlayOff Amateurs.
Il s'agit d'un prototype opérationnel permettant de vérifier que l'application
fonctionne de bout en bout : de la recherche d'un terrain jusqu'à la confirmation
d'un match avec gestion des joueurs.

---

## Périmètre fonctionnel couvert

### Ce qui fonctionne réellement

| Fonctionnalité | Détail |
|---|---|
| Recherche de terrains | Filtrage par sport (Football / Basket / Padel), tri par distance, note, prix |
| Sélection d'un terrain | Fiche détaillée avec photos, créneaux du jour, tarifs, badge Happy Hour |
| Choix d'un créneau | Calendrier 30 jours dynamique, créneaux disponibles/complets |
| Réservation | Sélection du créneau → redirection vers Mon match avec les paramètres |
| Organisation du match | Ajout/suppression de joueurs, calcul automatique du coût par joueur, barre de progression des paiements |
| Confirmation | Bouton "Confirmer le match" → badge "Confirmé" + redirection vers Mes réservations |
| Rappel joueurs | Bouton "Envoyer un rappel" simulé dans Mes réservations |

### Ce qui est volontairement simulé ou simplifié

| Élément | Raison de la simplification |
|---|---|
| Paiement | Simulé — un bouton marque le joueur comme "payé" localement. En production : intégration Stripe avec split automatique. |
| Envoi de lien aux joueurs | Simulé — copie dans le presse-papiers avec toast de confirmation. En production : envoi réel via SMS / WhatsApp / email. |
| Authentification | Écran de connexion présent mais non fonctionnel. En production : auth email + Google OAuth. |
| Données terrains | Hardcodées (18 terrains fictifs en Île-de-France). En production : base de données avec géolocalisation réelle. |
| Persistance des données | Aucune — les données sont réinitialisées à chaque rechargement. En production : Supabase avec RLS. |
| Géolocalisation | Non implémentée. En production : Google Maps API pour la carte et le calcul de distance réel. |

---

## Architecture technique

- **Stack** : React + TanStack Router (file-based routing)
- **Données** : 100 % hardcodées — aucun appel API, aucune base de données
- **Navigation** : `?terrainId=&slot=&date=` en query params entre les routes
- **UI** : Tailwind CSS + shadcn/ui, responsive 375 / 768 / 1280 px
- **Charte** : Navy `#0D1B4B` / Orange CTA `#FF6B00` / Blanc `#FFFFFF`

---

## Parcours utilisateur complet (happy path)

1. **Accueil** → liste des terrains
2. **Filtrer** par sport ou trier par distance / note / prix
3. **Sélectionner** un terrain → fiche détaillée
4. **Choisir un créneau** dans le calendrier (30 jours dynamiques)
5. **Réserver** → redirection vers Mon match avec terrain + créneau + date
6. **Organiser le match** → voir les 10 joueurs, supprimer/ajouter, suivre les paiements
7. **Confirmer le match** → badge "Confirmé" + redirection automatique vers Mes réservations
8. **Mes réservations** → carte du match + bouton "Envoyer un rappel aux joueurs"

---

## Roadmap Bubble (Sprint 5-6)

Fonctionnalités à implémenter en production sous Bubble :

- Carte interactive des terrains (Google Maps)
- Authentification réelle (email + Google OAuth)
- Paiement Stripe réel + split automatique entre joueurs
- Profil utilisateur + historique des réservations
