Deux modifications précises :

1. **terrain.$id.tsx** — Ajouter `localStorage.removeItem("playoff_match")` juste avant l'appel `navigate({ to: "/mon-match", ... })` dans le bouton de réservation. Cela permet d'effacer les données d'un match précédent avant d'en créer un nouveau.

2. **mon-match.tsx** — Modifier l'initialisation de l'état `confirmed` pour vérifier si le `terrainId` du match sauvegardé dans le localStorage correspond au `terrainId` actuel (passé en query param). Si les terrains diffèrent, l'état `confirmed` repasse à `false`, évitant qu'un ancien match confirmé ne s'applique à un nouveau terrain.

Aucun autre fichier n'est touché.