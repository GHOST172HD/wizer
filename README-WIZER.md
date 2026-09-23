# Wizer Beauty — Guide de modification du site

Ce README sert à modifier le site sans casser le code.

L'idée importante : **tu ne modifies pas tout au hasard**.  
Dans 90 % des cas, tu modifies seulement les fichiers dans le dossier `data/`.

```text
data/
├── contact.js    → téléphone, WhatsApp, email, réseaux sociaux
├── salons.js     → adresses, Google Maps, coordonnées GPS, horaires
├── services.js   → services, tarifs, durées
├── gallery.js    → photos de la galerie
└── socials.js    → TikTok et Instagram
```

Les fichiers dans `js/` contiennent la logique du site.  
Ne les touche pas sauf si tu veux vraiment modifier le comportement.

```text
js/
├── galerie.js       → focus image, carousel, TikTok, Instagram et TikTok intégrés
├── localisation.js  → carte, distance, salon le plus proche
├── contact.js       → affichage de la page contact
├── reservation.js   → formulaire WhatsApp
└── salon-utils.js   → fonctions communes : horaires, téléphone, distance
```

Donc retiens cette règle :

```text
Je veux changer le contenu        → je vais dans data/
Je veux changer le design         → je vais dans css/style.css
Je veux changer le fonctionnement → je vais dans js/
```

---

# 1. Lancer le site dans VS Code

## Étape 1 — Ouvrir le projet

1. Décompresse le ZIP.
2. Ouvre le dossier dans VS Code.
3. Ouvre `index.html`.

## Étape 2 — Utiliser Live Server

Installe l'extension VS Code :

```text
Live Server
```

Puis :

```text
clic droit sur index.html
→ Open with Live Server
```

Le site s'ouvrira dans ton navigateur.

Ne double-clique pas juste sur `index.html` comme un sauvage. Certaines fonctions peuvent mal se comporter si le site n'est pas lancé avec un petit serveur local.

---

# 2. Structure rapide du site

```text
index.html         → Accueil
services.html      → Services et tarifs
galerie.html       → Photos, focus image, TikTok, Instagram
about.html         → À propos
localisation.html  → Carte et salons proches
contact.html       → Contacts et adresses
reservation.html   → Réservation par WhatsApp
```

---

# 3. Modifier les contacts du salon

Fichier à ouvrir :

```text
data/contact.js
```

Tu verras ceci :

```js
const SITE_CONTACT = {
  brandName: 'Wizer Beauty',
  mainPhone: '+243820068211',
  mainWhatsapp: '243820068211',
  email: 'contact@wizerbeauty.com',
  instagramUrl: '#',
  tiktokUrl: '#',
  facebookUrl: '#',
  contactNote: 'Remplace ces informations par les vrais contacts du salon.'
};
```

## Ce que chaque ligne veut dire

| Ligne | Sert à quoi |
|---|---|
| `brandName` | Nom du salon |
| `mainPhone` | Numéro affiché sur la page contact |
| `mainWhatsapp` | Numéro utilisé pour WhatsApp principal |
| `email` | Adresse email affichée |
| `instagramUrl` | Lien vers le compte Instagram |
| `tiktokUrl` | Lien vers le compte TikTok |
| `facebookUrl` | Lien vers Facebook |
| `contactNote` | Note interne ou phrase d'information |

## Exemple propre

```js
const SITE_CONTACT = {
  brandName: 'Wizer Beauty',
  mainPhone: '+243 820 068 211',
  mainWhatsapp: '243820068211',
  email: 'wizerbeauty@gmail.com',
  instagramUrl: 'https://www.instagram.com/wizer._/',
  tiktokUrl: 'https://www.tiktok.com/@wizer._',
  facebookUrl: '#',
  contactNote: 'Contact principal du salon Wizer.'
};
```

## Important pour WhatsApp

Pour `mainWhatsapp`, mets le numéro sans `+`, sans espace, sans tiret :

```js
mainWhatsapp: '243820068211'
```

Correct :

```text
243820068211
```

À éviter :

```text
+243 820 068 211
0820068211
243 820-068-211
```

Le site nettoie déjà un peu les numéros, mais donne-lui un truc propre. Il n'est pas devin, c'est du JavaScript, pas un marabout premium.

---

# 4. Modifier les salons et les localisations

Fichier à ouvrir :

```text
data/salons.js
```

C'est le fichier central pour :

```text
localisation.html
contact.html
reservation.html
```

Tu modifies un salon dans `data/salons.js`, et ça se met à jour dans plusieurs pages.

---

## 4.1 Comprendre `LOCATION_SETTINGS`

En haut du fichier, tu as :

```js
const LOCATION_SETTINGS = {
  defaultCenter: [-4.325, 15.31],
  defaultZoom: 12,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; OpenStreetMap contributors'
};
```

## Ce que ça veut dire

| Ligne | Rôle |
|---|---|
| `defaultCenter` | Centre de la carte quand la page s'ouvre |
| `defaultZoom` | Zoom de départ |
| `tileUrl` | Fond de carte OpenStreetMap |
| `tileAttribution` | Crédit obligatoire OpenStreetMap |

Si ton salon est à Kinshasa, laisse `defaultCenter` autour de Kinshasa.

Exemple :

```js
defaultCenter: [-4.325, 15.31],
defaultZoom: 12,
```

Si tu as plusieurs salons très éloignés, mets le centre entre eux.

---

## 4.2 Comprendre un salon

Dans `SALONS`, chaque salon ressemble à ceci :

```js
{
  id: 'gombe',
  name: 'Wizer Beauty — Gombe',
  district: '',
  address: 'Adresse exemple, Gombe, Kinshasa',
  city: 'Kinshasa',
  lat: -4.3105,
  lng: 15.2897,
  phone: '+243000000000',
  whatsapp: '243000000000',
  email: '',
  googleMapsUrl: '',
  hours: {
    monday: { open: '08:00', close: '18:00' },
    tuesday: { open: '08:00', close: '18:00' },
    wednesday: { open: '08:00', close: '18:00' },
    thursday: { open: '08:00', close: '18:00' },
    friday: { open: '08:00', close: '18:00' },
    saturday: { open: '09:00', close: '17:00' },
    sunday: null
  }
}
```

## Explication ligne par ligne

| Champ | Ce que tu mets |
|---|---|
| `id` | Identifiant court, sans espace, sans accent |
| `name` | Nom affiché du salon |
| `district` | Commune/quartier, facultatif |
| `address` | Adresse complète |
| `city` | Ville |
| `lat` | Latitude GPS |
| `lng` | Longitude GPS |
| `phone` | Numéro d'appel |
| `whatsapp` | Numéro WhatsApp du salon |
| `email` | Email du salon, facultatif |
| `googleMapsUrl` | Lien Google Maps du salon |
| `hours` | Horaires d'ouverture |

---

## 4.3 Le champ `id`

Le `id` doit être simple.

Correct :

```js
id: 'gombe'
```

Correct :

```js
id: 'limete'
```

Correct :

```js
id: 'ngaliema'
```

À éviter :

```js
id: 'Wizer Beauty Gombe'
```

À éviter :

```js
id: 'gombé'
```

À éviter :

```js
id: 'salon 1'
```

Pourquoi ?  
Parce que l'id sert aussi dans la réservation :

```text
reservation.html?salon=gombe
```

Donc reste simple.

---

## 4.4 Google Maps : ce que tu dois mettre

Tu as dit que tu vas créer les localisations avec Google Business. C'est très bien.

Tu n'as pas besoin d'un champ spécial `googleBusinessUrl`.

Tu utilises seulement :

```js
googleMapsUrl: '...'
```

## Méthode simple

1. Crée ou ouvre la fiche du salon dans Google Business.
2. Ouvre la fiche dans Google Maps.
3. Clique sur **Partager**.
4. Copie le lien.
5. Colle le lien ici :

```js
googleMapsUrl: 'https://maps.app.goo.gl/xxxxxxxx'
```

Exemple :

```js
googleMapsUrl: 'https://maps.app.goo.gl/AbCdEf123456'
```

Ce lien servira pour :

```text
Itinéraire
Ouvrir sur Google Maps
Bouton de localisation
```

---

## 4.5 Coordonnées GPS : `lat` et `lng`

Le lien Google Maps ne suffit pas toujours pour placer correctement le point sur la carte interne du site.

Le site a aussi besoin de :

```js
lat: -4.3105,
lng: 15.2897,
```

## Comment récupérer `lat` et `lng`

### Méthode 1 — Depuis Google Maps

1. Va sur Google Maps.
2. Clique sur le salon.
3. Fais clic droit sur le point exact.
4. Google Maps affiche des coordonnées du genre :

```text
-4.32512, 15.31288
```

Donc tu mets :

```js
lat: -4.32512,
lng: 15.31288,
```

### Méthode 2 — Depuis l'URL Google Maps

Parfois, l'URL contient un morceau comme :

```text
@-4.32512,15.31288,17z
```

Donc :

```js
lat: -4.32512,
lng: 15.31288,
```

## Attention

Kinshasa est au sud de l'équateur, donc la latitude est souvent négative :

```js
lat: -4.32512
```

La longitude vers Kinshasa tourne autour de :

```js
lng: 15.xxxxx
```

Ne mélange pas latitude et longitude, sinon ton salon risque de partir faire carrière dans l'océan.

---

## 4.6 Horaires

Les jours sont en anglais dans le code :

```text
monday    → lundi
tuesday   → mardi
wednesday → mercredi
thursday  → jeudi
friday    → vendredi
saturday  → samedi
sunday    → dimanche
```

Exemple ouvert lundi :

```js
monday: { open: '08:00', close: '18:00' }
```

Exemple fermé dimanche :

```js
sunday: null
```

Le format doit être :

```text
HH:MM
```

Correct :

```js
open: '08:30'
```

Incorrect :

```js
open: '8h30'
```

Incorrect :

```js
open: '8:30 matin'
```

---

## 4.7 Exemple complet d'un vrai salon

```js
{
  id: 'gombe',
  name: 'Wizer Beauty — Gombe',
  district: 'Gombe',
  address: 'Avenue Exemple n°12, Gombe, Kinshasa',
  city: 'Kinshasa',
  lat: -4.32512,
  lng: 15.31288,
  phone: '+243 820 068 211',
  whatsapp: '243820068211',
  email: 'wizerbeauty@gmail.com',
  googleMapsUrl: 'https://maps.app.goo.gl/xxxxxxxx',
  hours: {
    monday: { open: '08:00', close: '18:00' },
    tuesday: { open: '08:00', close: '18:00' },
    wednesday: { open: '08:00', close: '18:00' },
    thursday: { open: '08:00', close: '18:00' },
    friday: { open: '08:00', close: '18:00' },
    saturday: { open: '09:00', close: '17:00' },
    sunday: null
  }
}
```

---

## 4.8 Ajouter un nouveau salon

Dans `SALONS`, tu copies un bloc salon complet, puis tu changes les informations.

Exemple :

```js
const SALONS = [
  {
    id: 'gombe',
    name: 'Wizer Beauty — Gombe',
    ...
  },
  {
    id: 'limete',
    name: 'Wizer Beauty — Limete',
    ...
  },
  {
    id: 'matete',
    name: 'Wizer Beauty — Matete',
    ...
  }
];
```

Attention à la virgule entre les salons.

Correct :

```js
},
{
```

Erreur classique :

```js
}
{
```

Là, JavaScript tombe par terre comme un carreleur sans genouillères.

---

## 4.9 Supprimer un salon

Tu supprimes tout son bloc :

```js
{
  id: 'limete',
  name: 'Wizer Beauty — Limete',
  ...
},
```

Si c'était le dernier salon, enlève la virgule du bloc précédent si nécessaire.

---

# 5. Modifier les services et tarifs

Fichier à ouvrir :

```text
data/services.js
```

Tu verras une structure comme ceci :

```js
const SERVICES = [
  {
    category: 'Coiffure femme',
    items: [
      { name: 'Tresses classiques', price: 'À partir de 20 $', duration: '2 à 4 h' },
      { name: 'Brushing', price: 'À partir de 10 $', duration: '45 min' }
    ]
  }
];
```

## Ajouter un service

Tu ajoutes une ligne dans `items`.

Exemple :

```js
{ name: 'Pose perruque', price: 'À partir de 15 $', duration: '1 h' }
```

## Ajouter une catégorie

Exemple :

```js
{
  category: 'Soins visage',
  items: [
    { name: 'Nettoyage visage', price: 'À partir de 12 $', duration: '45 min' }
  ]
}
```

## Conseil

Utilise `À partir de` si le prix dépend du modèle ou de la longueur.

Exemples :

```text
À partir de 10 $
À partir de 25 $
Sur devis
Selon modèle
```

---

# 6. Modifier la galerie photo

Fichier à ouvrir :

```text
data/gallery.js
```

Les images doivent être placées ici :

```text
assets/images/galerie/
```

Exemple :

```text
assets/images/galerie/tresses-01.webp
assets/images/galerie/nails-01.webp
assets/images/galerie/salon-01.webp
```

Évite les noms avec espaces.

Correct :

```text
tresses-01.jpg
manucure-rose-01.jpg
```

À éviter :

```text
ma photo jolie finale.jpg
```

---

## 6.1 Comprendre une image de galerie

Exemple :

```js
{
  id: 'coiffure-01',
  src: 'assets/images/galerie/photo-01.webp',
  alt: 'Exemple de coiffure',
  category: 'coiffure-tresse',
  collectionKey: 'coiffure-tresse',
  viewer: 'collection',
  title: 'Exemple de coiffure / tresse'
}
```

## Explication

| Champ | Rôle |
|---|---|
| `id` | Identifiant unique de l'image |
| `src` | Chemin vers l'image |
| `alt` | Description pour accessibilité et SEO |
| `category` | Catégorie utilisée par les filtres |
| `collectionKey` | Groupe d'images dans le focus |
| `viewer` | `collection` ou `single` |
| `title` | Titre affiché dans le focus |

---

## 6.2 Image qui ouvre une collection

Si plusieurs images doivent défiler ensemble, utilise :

```js
viewer: 'collection',
collectionKey: 'coiffure'
```

Exemple :

```js
{
  id: 'coiffure-01',
  src: 'assets/images/galerie/coiffure-01.jpg',
  alt: 'Coiffure tressée',
  category: 'coiffure-tresse',
  collectionKey: 'coiffure-tresse',
  viewer: 'collection',
  title: 'Coiffure / tresse'
}
```

Toutes les images avec :

```js
collectionKey: 'coiffure'
```

seront dans le même focus/carousel.

---

## 6.3 Image unique

Si une image doit juste s'agrandir seule, utilise :

```js
viewer: 'single'
```

Exemple :

```js
{
  id: 'salon-01',
  src: 'assets/images/galerie/salon-01.webp',
  alt: 'Intérieur du salon',
  category: 'soins',
  collectionKey: 'salon',
  viewer: 'single',
  title: 'Notre espace'
}
```

Dans ce cas :

```text
clic sur l'image → focus simple
pas de collection autour
pas de navigation entre images
```

---

## 6.4 Catégories existantes

Les catégories prévues sont :

```text
coiffure-tresse
manucure
pedicure
soins
```

Ces noms doivent correspondre à ce qui existe dans `js/galerie.js`, dans le bloc :

```js
const labels = {
  all: 'Tout',
  'coiffure-tresse': 'Coiffure / Tresse',
  manucure: 'Manucure',
  pedicure: 'Pédicure',
  soins: 'Soins'
};
```

Si tu ajoutes une catégorie dans `data/gallery.js`, par exemple :

```js
category: 'maquillage'
```

Alors ajoute aussi dans `js/galerie.js` :

```js
maquillage: 'Maquillage'
```

Donc :

```js
const labels = {
  all: 'Tout',
  'coiffure-tresse': 'Coiffure / Tresse',
  manucure: 'Manucure',
  pedicure: 'Pédicure',
  soins: 'Soins',
  maquillage: 'Maquillage'
};
```

C'est l'une des rares fois où tu dois toucher à `js/galerie.js`.

---

## 6.5 Formats d'image

Le focus respecte les ratios :

```text
16:9
4:5
1:1
9:16
portrait
paysage
```

L'image n'est pas étirée.

Elle utilise le principe :

```css
object-fit: contain;
```

Donc elle garde son vrai format.  
Si tu vois des bandes vides autour, c'est normal : le site protège l'image au lieu de la déformer comme une pizza roulée.

---

# 7. Modifier TikTok et Instagram

Fichier à ouvrir :

```text
data/socials.js
```

Tu verras :

```js
const SOCIAL_ITEMS = [
  { type: 'tiktok', title: 'Exemple TikTok', videoId: '6718335390845095173', url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173' },
  { type: 'instagram', title: 'Publication Instagram à ajouter', url: '' }
];
```

---

## 7.1 Ajouter une vidéo TikTok

Une vidéo TikTok doit avoir :

```js
{
  type: 'tiktok',
  title: 'Coiffure',
  videoId: '7295160311147941125',
  url: 'https://www.tiktok.com/@wizer._/video/7295160311147941125'
}
```

## Le piège du `videoId`

Dans ton exemple, tu avais :

```js
videoId: '7635674125223446017'
```

Mais dans ton lien :

```text
https://www.tiktok.com/@wizer._/video/7295160311147941125?...
```

Le vrai `videoId`, c'est le nombre après `/video/`.

Donc le bon ID est :

```js
videoId: '7295160311147941125'
```

Pas le `web_id`.

## Version corrigée de ton exemple

```js
const SOCIAL_ITEMS = [
  {
    type: 'tiktok',
    title: 'Coiffure',
    videoId: '7295160311147941125',
    url: 'https://www.tiktok.com/@wizer._/video/7295160311147941125'
  },
  {
    type: 'instagram',
    title: '#NailsNails',
    url: 'https://www.instagram.com/reel/DAa0_IFMvyG/'
  }
];
```

## Conseil

Nettoie les liens.

Au lieu de garder :

```text
?is_from_webapp=1&sender_device=pc&web_id=...
```

Garde seulement :

```text
https://www.tiktok.com/@wizer._/video/7295160311147941125
```

C'est plus propre.

---

## 7.2 Ajouter plusieurs TikTok

Exemple :

```js
const SOCIAL_ITEMS = [
  {
    type: 'tiktok',
    title: 'Coiffure',
    videoId: '7295160311147941125',
    url: 'https://www.tiktok.com/@wizer._/video/7295160311147941125'
  },
  {
    type: 'tiktok',
    title: 'Manucure',
    videoId: '1234567890123456789',
    url: 'https://www.tiktok.com/@wizer._/video/1234567890123456789'
  }
];
```

Chaque objet doit être séparé par une virgule.

---

## 7.3 Instagram dans la version actuelle

Actuellement, le site **prévoit Instagram**, mais il ne transforme pas automatiquement une URL Instagram en publication lisible.

Dans `js/galerie.js`, la partie TikTok crée un vrai lecteur :

```js
iframe src="https://www.tiktok.com/player/v1/..."
```

Mais pour Instagram, le code affiche seulement un bloc d'attente :

```text
Ajoute ici le code d’intégration d’une publication Instagram publique.
```

Donc si tu mets ceci dans `data/socials.js` :

```js
{
  type: 'instagram',
  title: '#NailsNails',
  url: 'https://www.instagram.com/reel/DAa0_IFMvyG/'
}
```

Le lien est enregistré, mais l'intégration lisible n'est pas encore automatique dans cette version.

C'est normal si Instagram affiche encore un placeholder.  
Ce n'est pas toi qui es nul, c'est juste que le code actuel ne fait pas encore l'intégration Instagram complète.

## Ce qu'il faut retenir

| Réseau | Dans cette version |
|---|---|
| TikTok | Vidéo lisible directement si `videoId` est correct |
| Instagram | Emplacement prévu, mais intégration automatique non activée |

Si tu veux qu'Instagram marche comme TikTok, il faudra modifier un peu `js/galerie.js` plus tard pour injecter le vrai embed Instagram. Là, ce README explique l'état exact du site pour éviter le mensonge confortable.

---

# 8. Comprendre le code que tu as collé de `js/galerie.js`

Tu as collé un gros morceau de `js/galerie.js`.  
Tu n'es pas censé modifier la majorité de ce fichier.

Voici ce qu'il fait, simplement.

## Ces lignes trouvent les zones HTML

```js
const galleryGrid = document.querySelector('#gallery-grid');
const filters = document.querySelector('#gallery-filters');
const socialGrid = document.querySelector('#social-grid');
```

Ça veut dire :

```text
#gallery-grid    → zone où les photos s'affichent
#gallery-filters → boutons Tout, Coiffure, Manucure...
#social-grid     → zone TikTok / Instagram
```

## Ce bloc crée les noms des filtres

```js
const labels = {
  all: 'Tout',
  'coiffure-tresse': 'Coiffure / Tresse',
  manucure: 'Manucure',
  pedicure: 'Pédicure',
  soins: 'Soins'
};
```

Tu modifies ce bloc seulement si tu ajoutes une nouvelle catégorie.

## Cette fonction protège le HTML

```js
function escapeHTML(value = '') { ... }
```

Ne touche pas.  
Elle évite que du texte injecté dans la page casse le HTML.

## `renderGallery()`

Cette fonction prend les images dans :

```text
data/gallery.js
```

et les affiche dans la page galerie.

Donc tu ne mets pas tes images dans `js/galerie.js`.  
Tu les déclares dans :

```text
data/gallery.js
```

## `getLightboxCollection()`

Cette fonction décide si l'image ouvre :

```text
une collection
ou
une image seule
```

Elle regarde :

```js
viewer: 'collection'
```

ou :

```js
viewer: 'single'
```

## `getModal()`

Cette fonction crée la grande fenêtre quand tu cliques sur une image :

```text
fond flouté
image centrale
images autour
croix de fermeture
navigation
swipe mobile
```

Ne touche pas sauf si tu veux changer le comportement du focus.

## `SOCIAL_ITEMS.map(...)`

Cette partie lit :

```text
data/socials.js
```

Pour TikTok, elle crée un lecteur vidéo.  
Pour Instagram, elle affiche le placeholder.

Donc pour changer TikTok, tu modifies :

```text
data/socials.js
```

Pas `js/galerie.js`.

---

# 9. Réservation WhatsApp

La page réservation utilise :

```text
reservation.html
js/reservation.js
data/contact.js
data/salons.js
data/services.js
```

## Comment le numéro WhatsApp est choisi

Quand le client choisit un salon :

1. Le site regarde si ce salon a un `whatsapp`.
2. Si oui, il envoie vers ce numéro.
3. Sinon, il utilise `SITE_CONTACT.mainWhatsapp`.

Donc tu peux faire deux choses.

## Option A — Tous les salons utilisent le même WhatsApp

Dans `data/contact.js` :

```js
mainWhatsapp: '243820068211'
```

Et dans `data/salons.js`, tu peux mettre le même numéro pour chaque salon :

```js
whatsapp: '243820068211'
```

## Option B — Chaque salon a son propre WhatsApp

Dans chaque salon :

```js
whatsapp: '243XXXXXXXXX'
```

Exemple :

```js
{
  id: 'gombe',
  name: 'Wizer Beauty — Gombe',
  whatsapp: '243820068211',
  ...
}
```

La réservation ira vers le WhatsApp du salon choisi.

---

# 10. Changer le logo

## Logo affiché dans le site

Fichier :

```text
assets/logo/logo-wizer.svg
```

Si tu veux remplacer le logo :

1. Mets ton nouveau logo dans `assets/logo/`.
2. Donne-lui le même nom :

```text
logo-wizer.svg
```

Comme ça, tu n'as pas besoin de modifier toutes les pages HTML.

## Agrandir le logo dans le menu

Fichier :

```text
css/style.css
```

Cherche :

```css
.brand img
```

Tu peux voir un truc comme :

```css
.brand img {
  width: 42px;
  height: 42px;
}
```

Remplace par :

```css
.brand img {
  width: clamp(140px, 22vw, 200px);
  height: auto;
  filter: drop-shadow(0 0 12px rgba(255, 91, 166, .28));
}
```

Si le logo devient trop gros, baisse les valeurs :

```css
width: clamp(120px, 18vw, 170px);
```

---

# 11. Changer la couleur des boutons

Fichier :

```text
css/style.css
```

Cherche au début :

```css
:root
```

Puis modifie :

```css
--accent: #ff5ba6;
--accent-2: #d9468b;
```

Exemple rose plus fort :

```css
--accent: #ff4fa3;
--accent-2: #b62270;
```

Tous les boutons principaux utilisent ces couleurs.

---

# 12. Déployer le site

## Pour tester gratuitement

Tu peux utiliser GitHub Pages.

Le site est statique :

```text
HTML
CSS
JS
images
```

Donc il peut être publié sur GitHub Pages.

## Pour une vraie version plus propre

Netlify est plus confortable :

```text
GitHub → Netlify → site en ligne
```

Netlify donne une adresse du genre :

```text
wizer-beauty.netlify.app
```

Plus tard, tu peux mettre un nom de domaine.

---

# 13. Erreurs fréquentes et solutions

## Image qui ne s'affiche pas

Vérifie :

```text
Le fichier existe vraiment ?
Le chemin est correct ?
L'extension est bonne ?
Majuscules/minuscules identiques ?
```

Exemple :

```js
src: 'assets/images/galerie/coiffure-01.jpg'
```

Le fichier doit vraiment s'appeler :

```text
coiffure-01.jpg
```

Pas :

```text
Coiffure-01.JPG
```

Sur certains serveurs, `JPG` et `jpg`, ce n'est pas pareil. Oui, c'est pénible. Non, ce n'est pas négociable.

---

## TikTok ne s'affiche pas

Vérifie :

```text
La vidéo est publique ?
Le videoId est bien le nombre après /video/ ?
Le lien est correct ?
Tu es connecté à Internet ?
Le navigateur ne bloque pas les embeds ?
```

Mauvais :

```js
videoId: '7635674125223446017'
```

Si ce nombre vient de `web_id`, ce n'est pas le bon.

Bon :

```js
videoId: '7295160311147941125'
```

Si l'URL contient :

```text
/video/7295160311147941125
```

---

## Instagram affiche seulement un message

Normal dans cette version.

Le code actuel affiche un placeholder Instagram.  
Il faudra activer une vraie intégration Instagram plus tard si tu veux que les Reels s'affichent comme TikTok.

---

## La carte ne s'affiche pas

Vérifie :

```text
Tu es connecté à Internet ?
Leaflet se charge ?
Tu as lancé avec Live Server ?
Tu n'as pas cassé data/salons.js ?
```

La carte utilise Leaflet depuis Internet :

```html
https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
```

Donc sans Internet, la carte peut ne pas s'afficher.

---

## La localisation ne marche pas

La géolocalisation demande :

```text
autorisation du navigateur
HTTPS en ligne
ou localhost en local
```

Avec Live Server, ça peut fonctionner localement.  
En ligne, il faut un site en HTTPS.

GitHub Pages et Netlify fournissent du HTTPS.

Si le client refuse la localisation, le site affiche quand même la liste des salons, mais ne peut pas calculer sa distance.

---

## Le salon le plus proche est faux

Vérifie :

```text
lat et lng ne sont pas inversés ?
les coordonnées sont bonnes ?
tu as bien mis des nombres, pas du texte bizarre ?
```

Correct :

```js
lat: -4.32512,
lng: 15.31288,
```

Incorrect :

```js
lat: 15.31288,
lng: -4.32512,
```

Là, le site n'est pas fou : tu lui as juste donné une boussole sous alcool.

---

## Ouvert / fermé incorrect

Vérifie :

```text
Les horaires sont au format HH:MM ?
Le jour est bien rempli ?
Le téléphone ou PC a la bonne heure ?
```

Correct :

```js
friday: { open: '08:00', close: '18:00' }
```

Fermé :

```js
sunday: null
```

---

# 14. Ordre conseillé pour modifier le site

Ne fais pas tout d'un coup. Fais dans cet ordre :

```text
1. data/contact.js
2. data/salons.js
3. data/services.js
4. assets/images/galerie/
5. data/gallery.js
6. data/socials.js
7. Tester toutes les pages
8. Publier
```

Après chaque modification, teste le site.  
Si tu modifies 40 trucs à la fois et que ça casse, bonne chance pour trouver le coupable. Même Sherlock va demander une pause.

---

# 15. Checklist finale avant publication

## Accueil

```text
Logo correct
Boutons visibles
Texte propre
Images correctes
```

## Services

```text
Prix corrects
Durées correctes
Catégories propres
```

## Galerie

```text
Images réelles
Images pas trop lourdes
Catégories correctes
Focus fonctionnel
Swipe mobile fonctionnel
```

## Réseaux

```text
TikTok publics
videoId corrects
Liens Instagram propres
```

## Localisation

```text
Google Maps URL pour chaque salon
lat/lng pour chaque salon
Horaires corrects
Bouton itinéraire OK
Bouton WhatsApp OK
```

## Contact

```text
Téléphone correct
WhatsApp correct
Email correct
Instagram/TikTok corrects
```

## Réservation

```text
Liste des salons OK
Liste des services OK
Message WhatsApp OK
Numéro WhatsApp correct
```

---

# 16. Les fichiers à ne pas casser

Évite de modifier ces fichiers sans raison :

```text
js/salon-utils.js
js/localisation.js
js/reservation.js
js/contact.js
```

Tu peux modifier `js/galerie.js` seulement si :

```text
tu ajoutes une nouvelle catégorie de filtre
ou
tu veux activer un vrai embed Instagram automatique
```

Sinon, tes contenus vivent dans `data/`.

---

# Résumé ultra-simple

```text
Contacts          → data/contact.js
Salons + Maps     → data/salons.js
Services + prix   → data/services.js
Photos            → assets/images/galerie/ + data/gallery.js
TikTok            → data/socials.js avec le bon videoId
Instagram         → prévu, mais pas encore auto-embed dans cette version
Design couleurs   → css/style.css
Logo              → assets/logo/logo-wizer.svg
```

Le fichier le plus important pour toi maintenant :

```text
data/salons.js
```

Parce qu'il contrôle :

```text
la carte
les distances
les horaires
les salons dans contact
les salons dans réservation
les itinéraires Google Maps
```

Si tu comprends `data/salons.js`, tu contrôles la moitié du site.
