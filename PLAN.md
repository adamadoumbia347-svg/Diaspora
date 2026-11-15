# Plan de lancement – Rotta Famiglia

Site de recherche de voyages pour familles italiennes avec enfants (0 à 12 ans).
Site en italien, travail prévu : 5 à 15 h par semaine.

## 0. Le modèle

Le site fonctionne comme un comparateur : le visiteur saisit une fois ses dates, sa destination et l'âge de ses enfants, puis il est envoyé vers Skyscanner (vols), Booking.com (hôtels) et GetYourGuide (activités) avec sa recherche déjà remplie. Tu touches une commission quand il réserve.

- **Avantage** : tu ne vends rien toi-même, donc pas de statut d'agence de voyage, pas de service client sur les réservations.
- **Limite** : la commission n'est que de quelques pour cent du prix, variable selon le programme. Il faut donc beaucoup de visiteurs pour un revenu réel. Exemple d'ordre de grandeur, à vérifier avec les vrais taux : si 2 visiteurs sur 100 réservent et qu'une réservation rapporte 10 €, il faut 5 000 visiteurs par mois pour 1 000 €.
- **C'est pourquoi l'itinéraire sur mesure reste sur le site** (page `itinerario.html`) : il rapporte dès le premier client, pendant que le trafic grandit.

### Comptes d'affiliation à ouvrir (gratuits)

Tant qu'ils ne sont pas renseignés dans `config.js`, les liens fonctionnent mais ne rapportent rien.

| Partenaire | Où s'inscrire | Ce qu'il faut reporter dans `config.js` |
|---|---|---|
| Booking.com | programme d'affiliation Booking | le numéro `aid` |
| GetYourGuide | programme partenaire GetYourGuide | le `partner_id` |
| Skyscanner | programme d'affiliation Skyscanner (ou un réseau comme Travelpayouts) | le modèle de lien suivi |

Ces programmes demandent en général un site déjà en ligne avec du contenu : mettre le site en ligne d'abord, s'inscrire ensuite. L'acceptation n'est pas garantie.

Les formats de liens vers les trois partenaires n'ont pas pu être testés depuis l'environnement de développement (accès réseau bloqué) : à vérifier en cliquant sur les trois boutons une fois le site en ligne.

## 1. L'offre payante : l'itinéraire sur mesure

| Formule | Durée du voyage | Prix |
|---|---|---|
| Weekend | jusqu'à 3 jours | 29 € |
| Vacanza | 4 à 7 jours | 59 € |
| Grande viaggio | 8 à 14 jours | 89 € |

- Livraison : PDF par email, 3 jours ouvrés après paiement, une révision incluse.
- Le client réserve lui-même vols, logements et billets.
- Ces prix sont un point de départ à tester, pas une vérité : à ajuster après les 10 premières commandes.

## 2. Comment l'argent rentre

1. **Tout de suite : les itinéraires payants.** Formulaire sur le site, puis tu envoies un lien de paiement par email.
2. **En continu : les commissions du moteur de recherche.** Elles grandissent avec le trafic, que tu construis avec les guides (référencement Google) et les réseaux sociaux. Compter plusieurs mois avant un revenu régulier.

## 3. Points légaux à régler avant d'encaisser

- **Ne pas vendre de séjours ni réserver pour le client.** En Italie, c'est une activité d'agence de voyage réglementée. Le site précise déjà que le service est du conseil uniquement.
- **Statut fiscal.** Une activité régulière avec site et publicité demande en général une Partita IVA (le « regime forfettario » est le cadre habituel pour débuter). À confirmer avec un commercialista avant la première vente : je ne peux pas trancher ce point à ta place.
- **Mentions à compléter sur le site** : nom ou raison sociale, P.IVA, email de contact (pied de page et page privacy, repérés par `[DA COMPLETARE]`).
- **Privacy.** La page est un brouillon à faire relire. Si tu ajoutes un pixel publicitaire ou des statistiques, il faudra un bandeau cookies.

## 4. Budget de départ (environ 500 €)

| Poste | Montant |
|---|---|
| Nom de domaine (.it ou .com) | 10 à 15 € par an |
| Hébergement (Netlify, offre gratuite) | 0 € |
| Publicité test sur Facebook et Instagram | 250 à 300 € |
| Premier rendez-vous commercialista | 50 à 150 € |
| Réserve | le reste |

## 5. Trouver les 10 premiers clients

- **Gratuit** : répondre utilement dans les groupes Facebook de parents italiens (« viaggiare con bambini », groupes de mamans par ville), sans spam ; compte Instagram ou TikTok avec 3 publications par semaine (une journée type d'itinéraire, une astuce, une destination).
- **Payant** : publicité Facebook/Instagram ciblée sur les parents d'enfants de 0 à 12 ans, 10 € par jour, deux annonces différentes à comparer.
- **Entourage** : offrir 3 itinéraires gratuits à des familles que tu connais, en échange d'un avis honnête et de l'autorisation de le publier. Le site n'affiche aucun témoignage tant qu'il n'y en a pas de vrais.

## 6. Produire un itinéraire (1 à 2 h)

1. Lire la demande, poser une question par email si un point manque.
2. Faire un premier jet avec un assistant IA à partir des réponses du formulaire.
3. **Vérifier à la main** chaque lieu : existence, horaires, âge minimum, réservation obligatoire, temps de trajet. C'est cette étape qui justifie le prix.
4. Mettre en page dans un modèle PDF unique et envoyer.

## 7. Calendrier sur 30 jours

| Semaine | À faire |
|---|---|
| 1 | Choisir le nom définitif et acheter le domaine, voir le commercialista, créer le lien de paiement (Stripe ou PayPal), compléter les mentions, mettre le site en ligne |
| 2 | Faire les 3 itinéraires offerts, créer le modèle PDF, ouvrir le compte Instagram, publier dans 3 groupes |
| 3 | S'inscrire aux programmes d'affiliation et remplir `config.js`, lancer la publicité à 10 € par jour, publier une troisième guide |
| 4 | Faire le bilan, garder l'annonce la plus efficace, ajuster les prix et la page |

## 8. Décider à la fin du mois

- **Objectif** : 10 itinéraires payés en 30 jours, et les trois comptes d'affiliation actifs.
- **Entre 3 et 9** : le besoin existe, il faut améliorer la page ou le ciblage et continuer un mois.
- **Moins de 3 après 250 € de publicité** : changer l'offre (par exemple une seule destination très précise) ou arrêter, sans remettre d'argent.

## 9. Ce qu'il reste à faire sur le site

- Le nom « Rotta Famiglia » est provisoire : vérifier que le domaine et le nom sont libres.
- Remplacer les `[DA COMPLETARE]`.
- Tester les trois boutons de recherche une fois en ligne et remplir `config.js`.
- Publier une nouvelle guide par semaine : c'est ce qui amène des visiteurs gratuits.
- Mettre en ligne sur Netlify : le formulaire fonctionne avec Netlify Forms, sans serveur, et les demandes arrivent par email une fois la notification activée.
- L'exemple sur Lisbonne est illustratif : à revérifier ou à remplacer par un de tes vrais itinéraires.
