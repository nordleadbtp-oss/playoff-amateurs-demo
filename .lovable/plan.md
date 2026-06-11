## Objectif
Resserrer la palette des statuts pour respecter strictement la règle 60/30/10 : seuls le navy (#0D1B4B) et l'orange (#FF6B00) doivent porter l'identité visuelle. Les statuts ne doivent plus introduire de nouvelles teintes (vert, jaune, orange pastel, violet…).

## Analyse actuelle
Les statuts utilisent aujourd'hui :
- **Vert** `#22C55E` / `#DCFCE7` : "Confirmé", "Payé", "Match confirmé", bouton "Rappel"
- **Jaune** `#FEF9C3` / `#92400E` : "En attente" (badge global)
- **Orange pastel** `#FED7AA` / `#9A3412` : "En attente" (badge joueur)
- **Couleurs d'avatar** vives : `#3B82F6`, `#A855F7`, `#EC4899`, `#14B8A6`, `#EAB308`

Cela crée 5+ teintes en plus du navy/orange, diluant la règle 60/30/10.

## Actions prévues

### 1. Badges de statut — 2 teintes max
| État | Avant | Après |
|------|-------|-------|
| Confirmé / Payé | Vert `#DCFCE7` + `#15803D` | **Navy très clair** `#E6EDF5` + texte `#0D1B4B` + icône check |
| En attente | Jaune `#FEF9C3` + `#92400E` ou Orange pastel | **Gris neutre** `#F3F4F6` + texte `#6B7280` + icône horloge |

- Unifier le badge global du match (`mon-match.tsx` ligne 176-184) et le badge par joueur (lignes 252-268) sur ces 2 teintes.
- Idem pour les cartes de `mes-reservations.tsx` (lignes 113-121).

### 2. Barre de progression — identité principale
- Remplacer le fond de barre vert (`#22C55E`) par un **dégradé navy → orange** (`linear-gradient(90deg, #0D1B4B, #FF6B00)`).
- Le fond vide reste `bg-muted`.

### 3. Bouton "Envoyer un rappel" — navy au lieu de vert
- `mon-match.tsx` ligne 338 : remplacer `background: "#22C55E"` par `background: "#0D1B4B"`.
- `mes-reservations.tsx` ligne 150 : conserver le bouton outline navy existant (déjà correct).

### 4. Avatars joueurs — palette désaturée
- Remplacer `AVATAR_COLORS` (`mon-match.tsx` ligne 69) par 8 teintes **tirées du navy et de l'orange**, mais très assourdies/pastel :
  ```ts
  ["#1E3A6F", "#4A6FA5", "#8FA8D3", "#0D1B4B",
   "#FF8C42", "#FFB885", "#4A3B2A", "#7A6B5A"]
  ```
  → 4 dérivés navy, 2 dérivés orange, 2 neutres chauds. Aucun vert, violet, rose, bleu électrique.

### 5. Badge "Renvoyer le lien" / "Envoyer le lien"
- `mon-match.tsx` lignes 287-290 : remplacer le vert (`#F0FDF4` / `#15803D`) par le gris neutre (`#F3F4F6` / `#6B7280`). Conserver le navy pour le bouton "non payé".

## Résultat attendu
Après les changements, la seule chromie de l'interface provient de :
- **#0D1B4B** (navy — identité principale)
- **#FF6B00** (orange — accent CTA)
- Les statuts deviennent des variations de luminosité (gris clair / navy clair) sans nouvelle teinte.
- Les avatars restent dans la famille navy/orange/neutre.

## Fichiers impactés
- `src/routes/mon-match.tsx` — badges statuts, barre progression, bouton rappel, couleurs avatar, boutons lien
- `src/routes/mes-reservations.tsx` — badges statuts cartes
- (Pas de nouveau fichier, pas de changement de logique métier)