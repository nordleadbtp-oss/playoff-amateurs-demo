# Export de l'historique des prompts

Créer un fichier markdown récapitulant tous les prompts utilisateur du projet PlayOff Amateurs pour archivage.

## Fichier créé

`/mnt/documents/playoff-amateurs-prompts-historique.md`

Emplacement `/mnt/documents/` → fichier persistant, téléchargeable directement depuis le chat via une balise `<presentation-artifact>`.

## Contenu du document

Structure en markdown :

- **En-tête** : titre, projet, date d'export (08/07/2026)
- **Liste chronologique** des 13 prompts identifiés, avec pour chacun :
  - Numéro et date
  - Titre / thème
  - Résumé du contenu (paraphrase — le contenu verbatim n'est pas toujours disponible via la recherche)
  - Fichiers principaux impactés (quand connus)
- **Section finale** : notes sur les limites (paraphrases vs verbatim, messages tool non indexés)

## Ce qui n'est PAS fait

- Aucune modification de code applicatif
- Pas de changement de configuration
- Uniquement la création d'un fichier de documentation dans `/mnt/documents/`

Confirmez pour que je passe en build et génère le fichier.
