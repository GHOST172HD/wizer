# Wizer Beauty — Guide de modification, version 4

**Mise à jour : 15 octobre 2026.** Ce guide correspond aux fichiers de `wizer(4).zip` ; il remplace les anciens exemples de l'ancien README qui ne correspondaient plus au contenu effectif.

Pour commencer rapidement, lis [README.md](README.md). Pour les problèmes de sécurité et de réglementation, lis [AUDIT_WIZER_V4.md](AUDIT_WIZER_V4.md).

## 1. Lancer le site

Ouvre le dossier `wizer/` dans VS Code, puis lance `index.html` avec **Live Server**. Le projet est statique : pas de Python, de Node.js exécuté côté serveur, de base de données ou de compte d'administration requis.

Les pages :

- `index.html` — Accueil, bandeau, services mis en avant, carrousel de réalisations.
- `services.html` — Services et tarifs.
- `galerie.html` — Photos, visionneuse et contenus TikTok/Instagram.
- `about.html` — À propos.
- `localisation.html` — Fond de carte, localisation facultative et liste des salons.
- `contact.html` — Coordonnées et salons actifs.
- `reservation.html` — Formulaire générant un message WhatsApp.

## 2. Modifier uniquement les données nécessaires

Les fichiers `data/` contiennent le contenu du site. Les fichiers `js/` pilotent son comportement.

| Modification | Fichier exact |
|---|---|
| Téléphone, WhatsApp, email, réseaux | `data/contact.js` |
| Salon(s), adresse(s), coordonnées GPS, horaires | `data/salons.js` |
| Prestations, prix, durées | `data/services.js` |
| Galerie, photos, catégories, collections | `data/gallery.js` |
| Vidéos TikTok et Instagram | `data/socials.js` |
| Couleurs, mise en page, animations | `css/style.css`, `css/responsive.css`, `css/animations.css` |
| Menu hamburger | HTML des 7 pages + `js/main.js` + CSS correspondant |
| Fonctionnement de la carte | `js/localisation.js`, `js/salon-utils.js` |
| Formulaire WhatsApp | `reservation.html`, `js/reservation.js` |

**Règle :** modifier les données avant d'envisager de modifier le code des fonctions. Après une modification, ouvrir toutes les pages concernées.

## 3. Contact du salon

Dans `data/contact.js`, l'objet `SITE_CONTACT` contient :

```js
const SITE_CONTACT = {
  brandName: 'WIZER',
  mainPhone: '+243820068211',
  mainWhatsapp: '243820068211',
  email: 'Wizer.institut@gmail.com',
  instagramUrl: 'https://www.instagram.com/wizer.beauty/',
  tiktokUrl: 'https://www.tiktok.com/@wizer._',
  facebookUrl: 'https://www.facebook.com/',
  contactNote: ''
};
```

- `mainWhatsapp` : numéro international **sans** `+`, espaces ni tirets.
- `mainPhone` : format affiché ; le lien `tel:` est normalisé par `js/salon-utils.js`.
- `facebookUrl` vaut actuellement la page d'accueil de Facebook et **pas une page Wizer identifiée** : ne pas le présenter comme compte officiel sans vérifier.
- La page `contact.html` ouvre une **composition Gmail** pour le lien email ; cela dépend du service Gmail, ce n'est pas un formulaire d'envoi sur serveur Wizer.

## 4. Salons, positions et horaires

Dans `data/salons.js` :

- `LOCATION_SETTINGS.defaultCenter = [-4.347158431021283, 15.28376598585388]` ; `defaultZoom = 15`.
- Un seul salon actif : `id: 'bandal'`, nom `WIZER INSTITUT - Bandal`.
- Adresse actuelle : `Nº 114, Rue Tumba, Quartier Bisengo, Commune de Bandalungwa, Kinshasa`.
- Coordonnées actuelles : latitude `-4.347158431021283`, longitude `15.28376598585388`.
- Lien Google Maps : renseigné dans le champ `googleMapsUrl` ; vérifier sur place sa concordance avec l'adresse.
- Horaires actuels : du lundi au samedi `08:00–18:30` ; dimanche `13:00–18:30`.
- `limete` et `ngaliema` existent uniquement comme **exemples inactifs** (`active: false`). Leurs adresses et contacts ne doivent pas être publiés comme réels.

Pour ajouter un salon : copier un objet existant du tableau `SALONS`, modifier **tous** ses champs réels, donner un `id` unique, puis le passer à `active: true`. Vérifier la carte et les menus de réservation.

**Géolocalisation** : le bouton « Utiliser ma position » déclenche une demande d'autorisation du navigateur. En cas de refus, la liste et la carte doivent rester consultables. La distance affichée est à vol d'oiseau, pas un trajet routier. Les horaires sont calculés avec l'heure locale du navigateur ; un visiteur dans un autre fuseau horaire peut voir un statut « ouvert/fermé » incorrect. Le corriger si cela pose problème.

**Fonds de carte** : `js/localisation.js` utilise en premier le fond Esri `World_Light_Gray_Base`, puis `tile.openstreetmap.org` si nécessaire. Il faut respecter les conditions de chaque fournisseur. Le fond raster Esri utilisé est annoncé comme retiré en décembre 2029.

## 5. Services et tarifs

Dans `data/services.js`, le tableau `SERVICES` groupe les prestations sous :

- `Coiffure`
- `Massage`
- `Manucure & Pédicure`
- `Maquillage & Cils`

Chaque `item` contient `name`, `price` et `duration`. Exemple de forme :

```js
{
  name: 'Brushing',
  price: 'À partir de 15 $',
  duration: '45 min'
}
```

Un clic sur « Réserver » transmet le nom du service dans le paramètre d'URL `?service=...`. Dans `js/reservation.js`, ce paramètre définit uniquement la valeur du menu déroulant ; il n'est pas recopié tel quel comme HTML.

**Sécurité à améliorer :** `js/services.js` insère actuellement les champs éditables directement avec `innerHTML`. Éviter tout code ou balise HTML dans les noms/prix/durées ; préférer des éléments DOM avec `textContent` ou un échappement HTML contextuel si tu modifies la logique.

## 6. Photos et galerie

Les photos sont déclarées dans `data/gallery.js` et stockées notamment dans `assets/images/galerie/`.

Les filtres proposés par `js/galerie.js` sont : **Tout**, **Coiffure / Tresse**, **Manucure**, **Pédicure**, **Soins**.

Pour une photo, renseigner correctement `id` (unique), `src` (chemin relatif vers le fichier), `category`, `alt` et, suivant la structure existante, `viewer` (`single` ou `collection`) et `collectionKey`.

- `single` : une image seule dans la visionneuse.
- `collection` : navigation entre les images du même groupe.
- L'image doit exister et correspondre à sa légende.
- Conserver l'autorisation d'utilisation des images lorsque des clients ou des membres de l'équipe sont identifiables.

`js/galerie.js` applique `escapeHTML()` à l'identifiant, aux chemins d'image et aux légendes dans l'essentiel du rendu de la galerie. **Cette protection n'est pas encore uniforme sur les autres pages.**

## 7. Publications TikTok et Instagram

Dans `data/socials.js`, il y a actuellement :

- Une entrée `type: 'tiktok'`, `videoId: '7295160311147941125'` : le vrai `videoId` est l'identifiant situé après `/video/`.
- Une entrée `type: 'instagram'`, avec l'URL d'un Reel.

`js/galerie.js` génère des `iframe` pour ces contenus. `loading="lazy"` réduit certains chargements, mais **n'est pas un choix de confidentialité**. Si un consentement aux traceurs est requis, il faut créer un aperçu local sans `src` d'iframe, puis charger la vidéo seulement après l'action du visiteur. Prévoir un refus et, si pertinent, un retrait du choix. Le guide ne prétend pas que ce mécanisme existe déjà.

## 8. Comment fonctionne la réservation

`reservation.html` demande : nom, téléphone, salon, service, date, heure et message facultatif.

`js/reservation.js` :

1. remplit les menus avec les salons actifs et les prestations ;
2. récupère les valeurs saisies ;
3. prépare un message texte ;
4. ouvre `https://wa.me/...` dans un nouvel onglet ;
5. laisse au client le soin **d'envoyer réellement** ce message et au salon le soin de **confirmer** le créneau.

Pas de réservation automatique ; pas de contrôle serveur d'occupation des créneaux et pas de système de stockage des demandes sur le site.

**Vie privée :** le nom, le numéro et les autres éléments saisis peuvent être transmis à WhatsApp via une URL avec paramètre `text`. Explique-le clairement au client ; éviter d'inviter à envoyer des informations médicales ou autres données sensibles dans le champ libre.

**Améliorations possibles, sans les modifier ici :** ajouter un court texte d'information près du bouton d'envoi, limiter les longueurs (`maxlength`), filtrer les caractères inappropriés pour le rendu, empêcher les dates passées et signaler l'éventuel blocage des pop-ups.

## 9. Design, menu et carrousel

- Thème sombre et rouge : modifier prioritairement les variables CSS de `css/style.css`.
- Éviter de renommer `.menu-toggle`, `#main-menu`, `.active` ou `.open` sans adapter `js/main.js` : l'ouverture/fermeture repose sur ces sélecteurs.
- Le carrousel de réalisations de l'accueil utilise `css/realisations-carousel.css` et `js/realisations-carousel.js`.
- Pour le logo : image `assets/logo/wizer.webp`; ne pas confondre avec la copie de travail `assets/logo/wizer.webp~` qu'il faut éviter de publier.

## 10. Sécurité et publication Cloudflare Pages

Le site public utilise désormais **https://wizer-kin.com/** sur **Cloudflare Pages**. `netlify.toml` correspond à l'ancien hébergement et ne configure pas Cloudflare Pages. Les métadonnées de `index.html` contiennent encore l'ancienne adresse Netlify : les mettre à jour avant le prochain déploiement.

`_headers` est compatible avec les fichiers statiques servis par Cloudflare Pages si placé dans le dossier de sortie. Il contient une CSP, `X-Frame-Options`, HSTS et `Permissions-Policy`. Vérifier les **réponses réellement servies** ; ne pas durcir la CSP sans tester les contenus externes et la carte.

L'archive originale contient `.git/` et une sauvegarde `assets/logo/wizer.webp~`. Publier uniquement les ressources du site (HTML, CSS, JS, data, images et `_headers`) ; ne pas déployer des secrets ou historiques de code. La présence du dépôt **dans le ZIP local** ne prouve pas qu'il est accessible sur le site public.

## 11. Obligations et transparence avant publication

1. Ajouter au site une page **Politique de confidentialité** décrivant les coordonnées collectées lors des demandes de rendez-vous, les destinataires, les durées de conservation et le contact chargé des demandes de suppression.
2. Ajouter des **mentions d'identification du salon** : raison sociale/nature de l'activité, adresse et contacts professionnels, selon la situation administrative réelle.
3. Vérifier la nécessité d'un mécanisme de **consentement aux embeds** TikTok/Instagram, puis l'intégrer si applicable.
4. Informer les visiteurs du recours aux fournisseurs de carte et des demandes de géolocalisation.
5. Vérifier les droits d'usage des photos, vidéos, logos et fonds de carte.
6. Vérifier l'application du **Code du numérique de la RDC**, notamment son titre consacré aux données personnelles, avec le responsable légal du salon.

**Attention :** les recommandations ci-dessus sont des tâches à réaliser, **pas des fonctionnalités déjà présentes**.

## 12. Vérifications rapides

Avant de publier une version sur Cloudflare Pages :

- [ ] Parcourir toutes les pages sur PC et téléphone.
- [ ] Vérifier la présence de tous les fichiers `src`/`href` locaux.
- [ ] Tester les boutons de contact et WhatsApp.
- [ ] Tester la galerie et le carrousel.
- [ ] Tester localisation autorisée **et** refusée.
- [ ] Vérifier l'heure locale de Kinshasa et les horaires affichés.
- [ ] Vérifier le consentement pour les vidéos tierces si nécessaire.
- [ ] Vérifier les pages légales et le traitement réel des données.
- [ ] Vérifier les en-têtes Cloudflare Pages sur le site en ligne.
- [ ] Vérifier qu'aucun dossier `.git/` ni fichier de sauvegarde n'est accessible publiquement.

### Références

- Droit RDC : https://droitnumerique.cd/code-du-numerique-congolais-rdc-pdf/livre-iii-titre-iii/
- CNIL embeds tiers : https://www.cnil.fr/fr/questions-reponses-lignes-directrices-modificatives-et-recommandation-cookies-traceurs
- Cloudflare Pages `_headers` : https://developers.cloudflare.com/pages/configuration/headers/
- OWASP DOM XSS : https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
- Politique des tuiles OSM : https://operations.osmfoundation.org/policies/tiles/

*Guide vérifié sur les fichiers de la version 4. Les obligations légales peuvent dépendre de la clientèle, de la juridiction et de l'organisation réelle du salon.*
