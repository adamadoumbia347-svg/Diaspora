# CarFree Dolomites

Site statique multilingue (EN / FR / IT) : visiter les Dolomites sans voiture.

## Commandes

```bash
npm install
npm run build     # génère ./dist
npm run serve     # aperçu local sur http://localhost:4173
```

## Structure

- `src/content/{en,fr,it}.mjs` – tous les textes, titres SEO, descriptions et slugs par langue
- `src/data.mjs` – configuration du site, sources officielles, tableau des liaisons
- `build.mjs` – générateur : pages HTML, hreflang, données structurées, sitemap, robots.txt
- `src/styles.css`, `tailwind.config.js` – styles (Tailwind compilé, polices auto-hébergées)

## Variables d'environnement (optionnelles)

| Variable | Rôle |
| --- | --- |
| `SITE_URL` | Domaine canonique (sinon `URL` de Netlify, sinon `https://carfreedolomites.com`) |
| `GOOGLE_SITE_VERIFICATION` | Jeton de validation Google Search Console |
| `BOOKING_AID` | Identifiant d'affiliation Booking.com pour les liens hôtels |
| `ROADBOOK_CHECKOUT_URL` | Lien de paiement du roadbook (sinon : liste d'attente) |

## Déploiement

Prévu pour Netlify (`netlify.toml`) : commande `npm run build`, dossier `dist`.
Les formulaires (alertes horaires, liste d'attente, contact) utilisent Netlify Forms.

## Mise à jour saisonnière

Vérifier horaires, tarifs et règles d'accès auprès des opérateurs, corriger les textes,
puis changer `lastReviewed` dans `src/data.mjs`.
