# Wizer Beauty — site officiel

15 octobre 2026.  
**Site public :** https://wizer-kin.com/  
**Hébergement :** Cloudflare Pages, avec domaine personnalisé `wizer-kin.com`.

Site vitrine **HTML, CSS, JavaScript** (sans serveur applicatif ni base de données). Les clients consultent les prestations et préparent une **demande** de rendez-vous qui s'ouvre dans WhatsApp : aucune réservation n'est automatiquement confirmée par le site.

## Démarrage et mise en ligne

1. Ouvrir le dossier `wizer/` dans VS Code et utiliser Live Server pour l'aperçu local.
2. Sur Cloudflare Pages, définir comme répertoire de sortie le dossier contenant `index.html`, `css/`, `js/`, `data/`, `assets/` et `_headers` (pour ce site sans compilation, la racine du site si elle correspond au dossier de publication).
3. **Ne jamais déployer le dossier `.git/`**, ni les sauvegardes `*~`, archives ZIP ou fichiers secrets. Si Cloudflare Pages est relié directement à GitHub, contrôler le résultat du déploiement plutôt que confondre le dépôt et les fichiers servis publiquement.
4. `_headers` est **compatible avec Cloudflare Pages** pour les actifs statiques, à condition de se trouver dans le dossier publié. Contrôler sa présence effective dans les réponses HTTP.
5. `netlify.toml` est un reste de l'ancien hébergement ; Cloudflare Pages ne s'en sert pas pour configurer ce déploiement. Il peut être supprimé lors d'un nettoyage ultérieur.

Documentation de Cloudflare : https://developers.cloudflare.com/pages/configuration/headers/

## Les 3 corrections utiles

### 1. Domaine officiel dans `index.html` — à corriger maintenant

L'archive V4 contient encore `https://wizer-kin.netlify.app/` dans les métadonnées de l'accueil :

- `<link rel="canonical" ...>` ;
- `<meta property="og:image" ...>` ;
- `"image"` et `"url"` dans le JSON-LD de type `BeautySalon`.

Remplacer l'hôte `wizer-kin.netlify.app` par `wizer-kin.com` pour ces occurrences, **sans changer le chemin des images**. Vérifier la version en production après déploiement. Le domaine principal fonctionne en HTTPS.

### 2. Informations légales et confidentialité — à préparer en priorité

Ajouter et lier depuis le pied de page des pages commerciales :

- **Mentions légales** : exploitant réel, adresse professionnelle, téléphone, e-mail et détails administratifs applicables (ne pas inventer de numéros RCCM ou autres identifiants).
- **Confidentialité** : coordonnées saisies lors des réservations, finalité, usage de WhatsApp, destinataires, durée réelle de conservation, contact pour droits de consultation/suppression, plateformes externes et géolocalisation.

Près du formulaire, expliquer : « Votre demande sera ouverte dans WhatsApp. Votre rendez-vous n'est confirmé qu'après réponse du salon. »

Référence RDC : Code du numérique, ordonnance-loi n° 23/010 du 13 mars 2023, notamment art. 52–53 (informations fournies aux clients) et règles applicables aux données personnelles.

### 3. Vidéos intégrées — correction ciblée

`js/galerie.js` insère immédiatement les `iframe` TikTok/Instagram. Pour éviter les connexions et traceurs non essentiels avant le choix du visiteur, afficher une miniature locale et un bouton **Afficher la vidéo** qui ne crée l'iframe qu'après le clic. Garder le lien externe.

**Ne pas installer de bandeau cookies général par réflexe.** Le code propre à Wizer ne déclare pas de traceur marketing ou d'outil de statistiques. Vérifier séparément les fonctions éventuellement activées dans Cloudflare et les cookies effectivement déposés ; le régime de consentement dépend des traitements et des territoires concernés.

## Fichiers à connaître

| Modifier | Fichier |
|---|---|
| Téléphone, email, réseaux | `data/contact.js` |
| Salons, horaires, position | `data/salons.js` |
| Services et prix | `data/services.js` |
| Photos et catégories | `data/gallery.js` |
| TikTok/Instagram | `data/socials.js`, `js/galerie.js` |
| Bouton/menu mobile | `js/main.js`, HTML, CSS |
| Carte et géolocalisation | `js/localisation.js`, `js/salon-utils.js` |
| Réservation via WhatsApp | `reservation.html`, `js/reservation.js` |
| Sécurité HTTP sur Cloudflare Pages | `_headers` |
| Métadonnées du domaine officiel | `index.html` |

Le guide de maintenance détaillé est dans `README-WIZER.md`.

## Ce qui n'est pas une urgence démontrée

- `innerHTML` dans les pages Services/Contact/Carte utilise principalement des données locales que l'exploitant contrôle. Aucun chemin d'injection depuis les champs de visiteurs n'a été démontré ; améliorer ces insertions lorsqu'une entrée externe/dynamique est ajoutée.
- Les réglages CSP de `_headers` peuvent être davantage resserrés, mais il faut d'abord vérifier leur application et tester les intégrations : ne pas risquer de casser le site sans preuve d'une faille.
- Le fichier `.git` est présent **dans l'archive source**, mais son exposition sur le domaine public **n'a pas été établie**. Si sa publication était confirmée, ce serait un problème prioritaire.

## Limite de la vérification

Les principales pages du site public ont été consultées en HTTPS. La vérification des en-têtes HTTP réels, de la liste complète des cookies du navigateur et de la présence/absence de fichiers techniques non publics en ligne n'a pas pu être achevée avec les outils de consultation. Ces points ne doivent pas être présentés comme des failles confirmées.
