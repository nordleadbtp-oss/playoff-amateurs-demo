# Plan — 4 corrections PlayOff Amateurs

## 1. Logo image dans la navbar
- Uploader `Logo PLayoff.png` via `lovable-assets` → `src/assets/playoff-logo.png.asset.json` (le fichier `.asset.json` existant pointe vers une ancienne version, je le remplace).
- Dans `src/components/AppHeader.tsx`, remplacer le texte `PLAYOFF` par `<img src={logo.url} alt="PlayOff Amateurs" className="h-10 sm:h-12 w-auto" />`.
- Hauteur navbar conservée (h-16 / sm:h-20). Pas de fond, pas de container — logo posé directement sur navbar #0D1B4B (le logo a déjà son propre fond bleu marine arrondi).

## 2. Toggle "Voir plus / Voir moins" sur `/terrains`
- Bouton actuel "Voir plus de terrains" devient un toggle.
- Quand `showAll === true` → afficher "Voir moins de terrains" avec icône `ChevronUp`.
- Au clic sur "Voir moins" → `setShowAll(false)` + `window.scrollTo({ top: 0, behavior: 'smooth' })` pour revenir en haut de la liste.
- Affiché tant que `filtered.length > 3`.

## 3. Photos terrains basket + padel
- Les 3 terrains primaires actuels (id 1, 2, 3) sont tous Football. Pour basket et padel, on n'a que les listings secondaires.
- Ajouter le flag `primary: true` à 3 terrains basket (Gymnase Avon Centre, Salle Polyvalente Fontainebleau, Complexe Nemours Sud) et 3 padel (Club Padel Avon, Padel Arena Fontainebleau, Padel Club Moret).
- Remplacer les URLs Unsplash actuelles (certaines cassées) par des images générées via `imagegen` (`src/assets/court-basket-1.jpg` etc.) — 6 images au total (3 basket + 3 padel), format paysage 1024×640, qualité fast.
- Les terrains primaires de chaque sport remontent automatiquement en haut grâce à la logique de tri existante.

## 4. Calendrier 30 jours dynamique sur `/terrain/$id`

### Génération des créneaux
- Remplacer le `SLOTS_BY_DAY` hardcodé par un générateur qui produit 30 jours à partir d'**aujourd'hui** (`new Date()` au mount, stocké dans `useMemo`).
- Pour chaque jour : 6 créneaux fixes `09:00 / 11:00 / 14:00 / 16:00 / 18:00 / 20:00` avec prix variables (35–60 €).
- Statut `full` pseudo-aléatoire déterministe (basé sur `(dayIndex + slotIndex) % 5 === 0`) → environ 20 % de créneaux pris, reproductibles entre rendus.

### Statut dynamique du terrain
- En haut de page, le badge "Disponible / Complet" se calcule depuis les créneaux du jour sélectionné : `available = SLOTS[selectedDay].some(s => s.status === 'available')`.
- Si tous les créneaux du jour sont pris → badge gris "Complet ce jour".

### Vrai calendrier (bouton "Calendrier")
- Remplacer la sheet 2-boutons Juin/Juillet par un vrai `<Popover>` + `<Calendar>` (shadcn, déjà dispo) en `mode="single"`.
- `disabled: { before: today, after: today+29j }` pour limiter à la fenêtre des 30 jours.
- Bouton "Aujourd'hui" au-dessus du calendrier → `setSelectedDayISO(toISO(new Date()))` + ferme le popover.
- Sélection d'un jour → met à jour `selectedDayISO`, recale `weekStart` sur le lundi de la semaine de ce jour, ferme le popover.
- Le jour sélectionné est mis en évidence dans la bande des 7 jours (orange).

### Navigation semaine
- `<` / `>` bornées : on n'autorise pas d'aller avant la semaine d'aujourd'hui, ni après la semaine contenant `today+29j`.

### Récapitulatif droit
- Recalculé à partir du slot sélectionné, comme aujourd'hui. Si plus aucun slot dispo dans le jour sélectionné → message "Aucun créneau disponible ce jour".

## Contraintes respectées
- Aucune route ajoutée, `/connexion`, `/inscription`, `/mes-reservations` non modifiées.
- 100% hardcodé, aucun appel API.
- Transitions 200ms conservées, responsive 375/768/1280 inchangé.
- Charte 60/30/10 (navy / blanc / orange CTA) maintenue.

## Question
Tu confirmes que les 30 jours doivent commencer **à partir d'aujourd'hui** (date système réelle au chargement) plutôt qu'à partir d'une date fixe comme 9 juin 2026 ?
