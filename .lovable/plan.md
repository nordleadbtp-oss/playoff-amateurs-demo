# Plan — 4 corrections PlayOff Amateurs

## 1. Logo navbar (`src/components/AppHeader.tsx`)
Remplacer le bloc logo actuel par un simple texte :
```tsx
<Link to="/terrains" className="font-bold text-xl tracking-wide text-white">
  PLAYOFF
</Link>
```
Supprimer tout fond, container, icône ou bordure autour. Garder uniquement le texte blanc bold sur la navbar #0D1B4B.

## 2. Pagination terrains (`src/routes/terrains.tsx`)
- Ajouter `const [showAll, setShowAll] = useState(false)`
- `const visible = showAll ? terrains : terrains.slice(0, 3)`
- Sous la grille de cards, afficher un bouton **"Voir plus de terrains"** (style outline, bord navy, full width sur mobile / centré sur desktop) uniquement si `!showAll && terrains.length > 3`
- Au clic → `setShowAll(true)`, les 3 cards suivantes apparaissent en dessous (pas de rechargement, transition douce 200ms)
- La logique de filtre par sport reste prioritaire ; la pagination s'applique sur le résultat filtré.

## 3. Calendrier dynamique (`src/routes/terrain.$id.tsx`)

### State
```ts
const [weekStart, setWeekStart] = useState<Date>(new Date(2026, 4, 25)); // Lun 25 mai
const [selectedDayISO, setSelectedDayISO] = useState<string>("2026-05-31");
const [selectedSlotId, setSelectedSlotId] = useState<string>("c");
const [calendarOpen, setCalendarOpen] = useState(false);
```

### Navigation semaine
- `<` / `>` : `setWeekStart(d => addDays(d, -7 | +7))`
- Les 7 jours affichés sont calculés depuis `weekStart` (label "Lun/Mar..." + numéro)
- Le label "Dimanche 31 mai 2026" devient dynamique (formatté en FR à partir du jour sélectionné)

### Bouton "Calendrier"
- Au clic → `setCalendarOpen(true)` ouvre un Popover/Sheet listant 2 options : **"Juin 2026"** et **"Juillet 2026"**
- Sélection → `setWeekStart(new Date(2026, 5, 1))` ou `(2026, 6, 1)` puis ferme le panneau
- Pas de vrai DatePicker — juste 2 boutons fictifs comme demandé

### Créneaux par jour (constantes hardcodées)
Map `SLOTS_BY_DAY: Record<string, Slot[]>` avec une entrée par jour des 2 semaines de démo (mai 25 → juin 7 + 1 dim juillet pour montrer le changement de mois). Exemple :
```ts
const SLOTS_BY_DAY = {
  "2026-05-25": [
    { id:"a", time:"09:00", price:35, status:"available" },
    { id:"b", time:"11:00", price:40, status:"full" },
    { id:"c", time:"14:00", price:40, status:"available" },
    { id:"d", time:"16:00", price:50, status:"available" },
    { id:"e", time:"18:00", price:60, status:"available" },
    { id:"f", time:"20:00", price:60, status:"full" },
  ],
  "2026-05-31": [...], // les créneaux actuels
  // ... 1 entrée par jour, horaires/prix variés
};
const slots = SLOTS_BY_DAY[selectedDayISO] ?? [];
```
Fallback : si aucune entrée → afficher un état vide "Pas de créneaux ce jour".

### Récapitulatif droit dynamique
Recalculé depuis `selectedSlot` :
- **Date** = jour sélectionné formaté `Dim. 31 mai 2026`
- **Créneau** = `${slot.time} – ${slot.time+1h}`
- **Prix total** = `slot.price €`
- **Participation par joueur** = `slot.price / 10`
Si aucun slot sélectionné dans le jour courant → reset `selectedSlotId` au 1er slot dispo du jour quand `selectedDayISO` change (useEffect).

### Helpers
Petites fonctions locales `addDays`, `toISO`, `formatFR(date)` — pas de lib date externe.

## 4. Partage du lien (`src/routes/mon-match.tsx`)
- Supprimer les 2 boutons SMS/Mail actuels
- Remettre **un seul bouton orange** : `📤 Partager le lien de paiement`
- Au clic → ouvrir un `<Dialog>` (shadcn) centré, titre "Partager le lien de paiement", 2 boutons empilés :
  - `📱 Envoyer par SMS` → `toast.success("SMS envoyé aux joueurs")` + ferme
  - `✉️ Envoyer par mail` → `toast.success("Mail envoyé aux joueurs")` + ferme
- Le style respecte la charte : fond blanc, titre navy, CTA orange pour SMS / outline navy pour mail (un seul orange par écran).

## Contraintes respectées
- Aucune route ajoutée, `/connexion`, `/inscription`, `/mes-reservations` non touchées
- Aucune dépendance ajoutée (Dialog & Popover déjà dans shadcn/ui)
- 100% hardcodé, pas d'API
- Transitions 200ms, responsive 375/768/1280 inchangé

## Question avant build
Tu confirmes que les **2 semaines de démo** (25 mai → 7 juin + un saut juillet via le bouton Calendrier) suffisent, ou tu veux que je remplisse `SLOTS_BY_DAY` pour tout juin + juillet 2026 ?