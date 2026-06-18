## Plan : Application de la charte graphique officielle PlayOff Amateurs

### 1. Couleurs — remplacements globaux

| Ancienne | Nouvelle |
|----------|----------|
| `#FF6B00` | `#ed522a` |
| `#0D1B4B` | `#142852` |

**Fichiers concernés** (10 fichiers, ~45 occurrences) :
- `src/styles.css` — tokens CSS `--primary` et `--accent` (2 lignes)
- `src/routes/mes-reservations.tsx` — 4 occurrences inline + `max-w-2xl` → `max-w-4xl`
- `src/routes/terrains.tsx` — 3 occurrences inline
- `src/routes/mon-match.tsx` — ~17 occurrences inline + palette `AVATAR_COLORS`
- `src/routes/terrain.$id.tsx` — 5 occurrences inline
- `src/routes/connexion.tsx` — 1 occurrence inline
- `src/components/AppFooter.tsx` — 1 occurrence inline
- `src/components/AppHeader.tsx` — 1 occurrence inline
- `src/components/BottomNav.tsx` — 3 occurrences inline

### 2. Background dans styles.css

Changer `--background` de `oklch(0.974 0.011 240)` (#F0F4F8) vers `oklch(1 0 0)` (blanc pur).

### 3. Typographies

#### Dans `src/styles.css` :
- Remplacer `--font-sans` par `"Open Sans", ui-sans-serif, system-ui, sans-serif` pour le corps de texte.
- Ajouter des utilitaires `@utility` ou classes utilitaires pour les titres en `Inter` Bold/SemiBold.

#### Dans `src/routes/__root.tsx` :
- Ajouter le lien Google Fonts pour **Open Sans** (400, 600) aux côtés de l'import Inter existant.

#### Application typographique :
- Conserver `font-sans` sur `html, body` (Open Sans par défaut).
- Titres (`h1`, `h2`, `h3`) : appliquer `font-[family-name:Inter]` avec `font-bold` ou `font-semibold`.

### 4. Layout desktop dans mes-reservations.tsx

Remplacer `max-w-2xl` par `max-w-4xl` sur le `<main>` pour que le contenu utilise mieux la largeur desktop.

### 5. Vérification post-implémentation

- Vérifier que les dégradés linéaires (ex. `mon-match.tsx` `linear-gradient(90deg, #0D1B4B, #FF6B00)`) utilisent bien les nouvelles couleurs.
- S'assurer qu'aucune couleur legacy ne subsiste via un grep final.
- Contrôler le rendu visuel en preview.