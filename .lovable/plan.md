## Objectif

Aujourd'hui une seule réservation est mémorisée (clé `playoff_match` dans localStorage). Quand l'utilisateur réserve un nouveau terrain, l'ancienne est écrasée. On veut conserver **toutes les réservations** et les lister sur la page « Mes réservations ».

## Approche

Ajouter une seconde clé localStorage `playoff_reservations` qui stocke un **tableau** de réservations. La clé existante `playoff_match` continue de représenter le match « actif » en cours d'édition sur `/mon-match` (paiements, joueurs), pour ne rien casser.

### Format

```ts
type Reservation = {
  id: string;          // `${terrainId}_${date}_${slot}`
  terrainId: string;
  slot: string;
  date: string;
  players: Player[];
  confirmed: boolean;
  updatedAt: number;
};
```

### Changements fichier par fichier

1. **Nouveau `src/lib/reservations.ts`** — helpers :
   - `getReservations()` : lit le tableau depuis `localStorage`
   - `upsertReservation(r)` : ajoute ou met à jour (par `id`)
   - `removeReservation(id)`
   - `makeId(terrainId, date, slot)`

2. **`src/routes/mon-match.tsx`** :
   - Dans `saveToLS(...)`, après l'écriture de `playoff_match`, appeler `upsertReservation({...})` pour synchroniser la réservation courante dans la liste.
   - Inchangé sinon (joueurs, paiements, confirmation).

3. **`src/routes/terrain.$id.tsx`** :
   - Avant `navigate({ to: "/mon-match", ... })`, en plus du `removeItem("playoff_match")` déjà présent, appeler `upsertReservation` avec une réservation neuve (players = liste par défaut, confirmed = false) pour qu'elle apparaisse immédiatement dans « Mes réservations ».

4. **`src/routes/mes-reservations.tsx`** :
   - Remplacer la lecture unique par `getReservations()` et afficher **une carte par réservation** (boucle).
   - Chaque carte garde le même design actuel (emoji, nom, sport, créneau, ville, prix, badge Confirmé / En attente calculé depuis `players`).
   - Lien `Link to="/mon-match"` avec les `search` params de la réservation cliquée.
   - Ajouter un petit bouton « Supprimer » (icône) par carte qui appelle `removeReservation(id)`.
   - Conserver l'état vide quand la liste est vide.

### Hors scope

- Pas de persistance côté base de données (Lovable Cloud) — la demande est de garder en mémoire (localStorage), comme le reste de l'app.
- Pas de changement visuel autre que la liste multiple et le bouton supprimer.
- Pas de modification du flux de paiement / confirmation existant.
