Synchroniser le badge de statut en haut de la page **Mon match** avec l'état des paiements :

- **Tous les joueurs ont payé** → badge vert "Confirmé"
- **Au moins un joueur n'a pas payé** → badge jaune "En attente"

### Modification dans `src/routes/mon-match.tsx`

Le badge utilise actuellement l'état `confirmed` (déclenché par le bouton "Confirmer le match"). Je vais le remplacer par une valeur dérivée :

```ts
const allPaid = total > 0 && paidCount === total;
```

Et utiliser `allPaid` au lieu de `confirmed` dans le rendu du badge (ligne 168).

### Note sur le bouton "Confirmer le match"

Le bouton existant `Confirmer le match` (qui passe `confirmed=true` et redirige vers `/mes-reservations`) reste inchangé — il garde son rôle de finalisation/redirection. Seul l'affichage du **badge en haut** devient automatique selon les paiements.

Si tu préfères aussi masquer le bouton "Confirmer le match" tant que tout le monde n'a pas payé (ou le faire disparaître automatiquement quand `allPaid` est vrai), dis-le moi et je l'ajouterai.