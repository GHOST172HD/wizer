# Wizer Institut — wizer-kin.com

Site vitrine statique (HTML/CSS/JavaScript) hébergé sur **Cloudflare Pages**.
Rendez-vous : la page `reservation.html` prépare un message WhatsApp ; elle n'enregistre pas une réservation sur un serveur Wizer et ne la confirme pas automatiquement.

## Déploiement sécurisé sur Cloudflare Pages — IMPORTANT

Le 15 octobre 2026, `https://wizer-kin.com/.git/HEAD` renvoyait **HTTP 200**, prouvant que les métadonnées Git étaient exposées en production. La correction requiert un nouveau déploiement avec un dossier de sortie contrôlé ; `gitignore` et `robots.txt` ne protègent pas les anciens fichiers publiés.

Si le projet Pages est relié à GitHub :

- **Build command :** `sh build-cloudflare.sh`
- **Build output directory :** `dist`
- **Root directory :** le dossier qui contient `index.html` et `build-cloudflare.sh` (habituellement la racine du dépôt).

Le script prépare `dist/` avec seulement les pages et ressources publiques. **Il ne publie jamais `.git/`.** Ne publiez pas `.` comme output directory. Faites un nouveau déploiement de production après cette configuration.

Si le projet utilise le téléversement direct : envoyez uniquement le contenu de l'archive publique fournie, dont `index.html` est à la racine, et jamais l'archive source contenant `.git`.

**Vérification après déploiement (PowerShell)** :

```powershell
curl.exe -i https://wizer-kin.com/.git/HEAD
curl.exe -i https://wizer-kin.com/mentions-legales.html
curl.exe -i https://wizer-kin.com/confidentialite.html
```

Le premier appel ne doit plus renvoyer HTTP 200 avec un hash Git. Il faut une réponse HTTP 404 ou 403. Les deux autres pages doivent fonctionner. Si un ancien contenu persiste, vérifier le domaine de production, le déploiement actif et le cache Cloudflare. Vérifier également `/.git/config`, `/.git/index`, `/.git/logs/HEAD` et `/.git/objects/` : ils ne doivent pas être publics.

**En cas d'exposition de secrets dans l'historique Git**, les révoquer/renouveler : masquer `.git` ensuite ne rend pas un ancien secret déjà récupéré sûr.

## Informations légales

- `mentions-legales.html` — coordonnées, propriétaire légal et hébergeur.
- `confidentialite.html` — demandes WhatsApp, carte, services externes, droits et conservation.
- Liens ajoutés au pied de page de toutes les pages ; avertissement ajouté au formulaire.

**À remplir avant publication définitive** : identité juridique réelle de l'exploitant (et les identifiants d'immatriculation applicables), responsable de publication, durée effective de conservation des demandes WhatsApp. Ne pas inventer ces éléments.

Le formulaire, la carte, les vidéos, le menu, les styles principaux et la galerie sont conservés. **Les vidéos TikTok/Instagram restent chargées comme avant à la demande de l'exploitant** ; l'information sur les traceurs dans la politique n'équivaut pas à un recueil de consentement si celui-ci est requis.

## Carte — ce qu'il faut savoir

Le code `js/localisation.js` utilise actuellement l'ancien fond Esri World Light Gray Canvas, dont la fin est annoncée **en décembre 2029**. Le code possède déjà un **repli OpenStreetMap** et la page conserve les coordonnées, la liste des salons et les liens Google Maps. La fin d'Esri ne signifie donc pas la fermeture du site. **Il n'y a pas de garantie absolue de service des tuiles OSM** et leur politique impose des conditions d'usage, particulièrement pour un site commercial. À terme, envisager un fournisseur professionnel compatible avec Leaflet (clé et quota) ou une solution vectorielle comme OpenFreeMap/MapLibre, après test en préproduction, plutôt qu'une migration précipitée sans tests.

## Structure

- `index.html`, `services.html`, `galerie.html`, `about.html`, `localisation.html`, `contact.html`, `reservation.html`
- `mentions-legales.html`, `confidentialite.html`
- `css/` : styles du site et style spécifique `legal.css`
- `js/` : scripts des pages
- `data/` : services, salons, liens de contact
- `assets/` : images, logo, Leaflet local
- `_headers` : en-têtes de sécurité Cloudflare Pages
- `build-cloudflare.sh` : copie les seuls fichiers publics dans `dist/`

## Nouveau : carte fidélité (Cloudflare Pages + D1)

Deux interfaces : [carte client](fidelity-files/fidelity.html) et [scan agent](fidelity-files/scan-fidelity.html).

**L'installation de la base, des secrets et des fonctions Cloudflare est obligatoire.** Suivre [FIDELITY_SETUP.md](FIDELITY_SETUP.md) avant publication ; aucune donnée client ne doit être placée dans un JSON public.
