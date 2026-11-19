# Courrier expliqué

Première brique du « GPS de l'administration » : on photographie une lettre officielle et on
reçoit, dans sa langue, ce qu'elle dit, ce qu'il faut faire et avant quelle date.

Pays de départ : France. Langues : français simple, anglais, arabe, espagnol, portugais, turc,
ukrainien, russe, chinois, bambara, soninké, wolof, pulaar.

## Structure

- `public/index.html` — la page (photo ou PDF, choix de la langue, affichage du résultat).
- `netlify/functions/explain.mjs` — la fonction serveur `/api/explain` qui envoie le courrier
  à Claude et renvoie une explication structurée.

## Mise en ligne (Netlify)

1. Créer un site Netlify à partir de ce dépôt (les réglages sont dans `netlify.toml`).
2. Ajouter la variable d'environnement `ANTHROPIC_API_KEY` dans les réglages du site.
3. Déployer.

En local : `npm install`, puis `npx netlify dev` avec `ANTHROPIC_API_KEY` défini.

## Limites connues

- Chaque courrier expliqué consomme du crédit sur la clé API, et la fonction est ouverte à tous :
  prévoir une limite d'usage avant de diffuser largement le lien.
- La qualité est plus faible en bambara, soninké, wolof et pulaar que dans les grandes langues.
- L'explication n'est pas un conseil juridique.
