# Plan : corriger les encodages cassés dans la liste des terrains

## Contexte

Sur la page `/terrains`, plusieurs textes affichent encore des séquences mojibake :
- `À partir de 70 â,¬ / h` → devrait afficher `À partir de 70 € / h`
- `Localisé âœ"` → devrait afficher `Localisé ✓`

Ces erreurs apparaissent pour **tous les sports** (Football, Basket, Padel) car le prix est rendu par une seule ligne de template, et aussi dans la section "Voir plus de terrains" (même composant de carte).

## Fichier concerné

`src/routes/terrains.tsx` — 3 occurrences :

| Ligne | Avant | Après |
|------|-------|-------|
| 202 | `"Localisé âœ"` | `"Localisé ✓"` |
| 273 | `{t.price} â‚¬` (carte disponible) | `{t.price} €` |
| 298 | `{t.price} â‚¬` (carte complète) | `{t.price} €` |

Les lignes 273 et 298 couvrent les cartes visibles et les cartes du "Voir plus" (même boucle `visible.map`).

## Hors périmètre

Aucune autre modification : logique, styles, structure et données restent identiques. Les autres fichiers (`terrain.$id.tsx`, `mon-match.tsx`, `mes-reservations.tsx`) utilisent déjà `€` correctement — pas de changement.
