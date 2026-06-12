# Wizer Beauty — workspace VS Code

Site vitrine mobile-first en HTML, CSS et JavaScript.

## 1. Ouvrir le projet
1. Décompresse le dossier.
2. Dans VS Code : **Fichier > Ouvrir un dossier**.
3. Ouvre le dossier `salon-wizer-workspace`.
4. Installe l’extension **Live Server** si nécessaire.
5. Clic droit sur `index.html` > **Open with Live Server**.

## 2. Pages incluses
- `index.html` : accueil
- `services.html` : services et tarifs
- `galerie.html` : photos, TikTok et emplacement Instagram
- `about.html` : à propos
- `localisation.html` : carte, salons, horaires et distance approximative
- `contact.html` : coordonnées
- `reservation.html` : réservation WhatsApp

## 3. Fichiers à modifier en priorité
- `data/salons.js` : vraies adresses, coordonnées GPS, horaires et numéros
- `data/services.js` : vrais services, prix et durées
- `data/gallery.js` : vraies images
- `data/socials.js` : vrais liens TikTok et Instagram
- `js/reservation.js` : numéro WhatsApp principal (`MAIN_WHATSAPP`)
- `assets/logo/logo-wizer.svg` : remplacer le logo d’exemple

## 4. Galerie sociale
### TikTok
Dans `data/socials.js`, remplace `videoId` par l’identifiant public de la vidéo TikTok. Il se trouve à la fin d’une URL de type :
`https://www.tiktok.com/@compte/video/123456789...`

### Instagram
Instagram fournit un code d’intégration HTML pour les publications publiques. Copie ce code depuis la publication Instagram et remplace le bloc d’exemple dans `galerie.html` ou adapte `js/galerie.js`.

## 5. Localisation
La carte utilise Leaflet 1.9.4 et les tuiles OpenStreetMap. La position du visiteur est demandée uniquement lorsqu’il clique sur **Utiliser ma position**.

Le calcul actuel donne une distance approximative à vol d’oiseau. Le bouton **Itinéraire** ouvre Google Maps.

## 6. Tests recommandés
- Téléphone : 320 px, 375 px, 430 px
- Tablette : 768 px
- Ordinateur : 1024 px et 1440 px
- Tester le menu hamburger
- Tester la galerie
- Tester la localisation sur un site HTTPS publié
- Tester le bouton WhatsApp

## 7. Publication
Tu peux publier le dossier sur Netlify ou le stocker sur GitHub. Pour la géolocalisation en production, utilise HTTPS.
