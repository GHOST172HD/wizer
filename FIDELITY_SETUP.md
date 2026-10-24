# Wizer Fidelity — installation, sécurité et exploitation

> **Attention : cette version tourne sur Cloudflare Workers, pas Cloudflare Pages Functions.** Pour les instructions actuelles de liaison D1 et de déploiement, lis en priorité **`WORKERS_DEPLOYMENT.md`**. Les instructions « Pages → Bindings » ci-dessous étaient destinées à l’ancienne architecture et ne doivent pas être suivies pour le Worker `wizer`.

## Avant toute mise en ligne

**Les deux pages sont développées, mais le système ne fonctionnera PAS tant que la base D1, les secrets et les Pages Functions ne sont pas configurés.** En l'absence des secrets, les API renvoient `503`, sans créer ni attribuer des points. Il s'agit d'une mesure volontaire de sécurité.

### 1. Architecture (MERISE)

Modèle conceptuel de données (MCD) :

- Un **CLIENT** possède 0..N **MOUVEMENTS_POINTS**, chaque mouvement se rapporte à exactement 1 client.
- Un **CLIENT** détient 0..N **SESSIONS**, chaque session client appartient à 1 client (session agent : aucun client).
- Une **RÉCOMPENSE** correspond à 0..N **UTILISATIONS_RÉCOMPENSES** ; chaque utilisation concerne un client et une récompense.
- Un **CLIENT** possède 0..N **RÉINITIALISATIONS** de mot de passe.

Modèle logique relationnel (MLD) : `clients`, `sessions`, `mouvements_points`, `recompenses`, `utilisations_recompenses`, `reinitialisations`, `tentatives_connexion`.

Source : `database/fidelity_schema.sql`. D1 (SQLite) gère les contraintes d'unicité et clés étrangères. Le total de points est maintenu côté serveur à partir de mouvements historisés. Pour toute réclamation, consulter le journal plutôt que modifier le total directement.

**Aucun JSON public ne contient les données des clients.** Les réponses HTTP de l'API sont du JSON temporaire ; le stockage permanent est D1 privé. Les récompenses sont actuellement des **idées désactivées** (NULL pour le seuil de points).

### 2. Créer la base D1

Dans Cloudflare, aller dans **Workers & Pages → D1 SQL Databases → Create** et nommer la base, par exemple `wizer-fidelity`. Exécuter le SQL de `database/fidelity_schema.sql` via la console D1, ou avec Wrangler :

```bash
npx wrangler d1 execute wizer-fidelity --remote --file=database/fidelity_schema.sql
```

Puis dans **Workers & Pages → ton projet Pages → Settings → Bindings → Add → D1 database** :

- **Variable name : `FIDELITY_DB`** (respecte majuscules)
- Choisir la base `wizer-fidelity`.

Redéployer ensuite. Ne publie pas le fichier SQL dans `dist`.

### 3. Définir le mot de passe agent (c'est ici)

Dans **Pages → Settings → Variables and Secrets**, créer des **Secrets**, pas des variables publiques :

| Nom exact | Valeur à créer |
|---|---|
| `FIDELITY_ADMIN_PASSWORD` | Ton mot de passe agent de 16 caractères minimum, long et unique. C'est **ICI** que tu le définis et le changes. |
| `FIDELITY_PEPPER` | Chaîne aléatoire secrète d'au moins 32 caractères, conservée lors des futures mises à jour. |
| `FIDELITY_ENC_KEY` | Clé AES-256 aléatoire, encodée en Base64 standard (32 octets avant encodage). |
| `FIDELITY_INDEX_KEY` | Clé HMAC aléatoire, encodée en Base64 standard (32 octets avant encodage). |

Pour générer des valeurs sur ton PC (sans les transmettre ici) :

```bash
node -e "console.log('AES', require('crypto').randomBytes(32).toString('base64')); console.log('HMAC', require('crypto').randomBytes(32).toString('base64')); console.log('PEPPER', require('crypto').randomBytes(32).toString('hex'))"
```

**Ne modifie pas les trois secrets cryptographiques après l'ouverture des comptes** sans migration appropriée : cela rendrait les données chiffrées ou les mots de passe inutilisables. Ne les mets jamais dans GitHub, JavaScript ou le README.

### 4. Récupération par email (option à configurer avant le lancement)

Le formulaire « mot de passe oublié » est prévu, mais il exige un service d'envoi de mail. Crée un compte chez [Resend](https://resend.com/), vérifie ton domaine pour l'envoi, puis définis :

- Secret `RESEND_API_KEY` : ta clé API privée.
- Variable `FIDELITY_EMAIL_FROM` : par exemple `Wizer <fidelity@wizer-kin.com>` (une adresse autorisée sur ton domaine vérifié).

Les liens durent **20 minutes**, sont à usage unique et invalident les anciennes sessions après changement de mot de passe. Tant que Resend n'est pas configuré, l'API annonce que la récupération est indisponible. **Ne lance pas le programme pour de vrais clients tant que les emails de récupération n'ont pas été testés.**

### 5. Construire et publier sur Cloudflare Pages

Avec le dépôt GitHub connecté (pas un simple glisser-déposer du ZIP) :

- **Build command : `sh build-cloudflare.sh`**
- **Build output directory : `dist`**
- **Root directory : dossier du site** (là où se trouvent `index.html`, `build-cloudflare.sh`, `functions/`).

Le code serveur `functions/api/fidelity/[[path]].js` doit rester **dans le dépôt à la racine**, en dehors du dossier public `dist`. Cloudflare Pages détecte les Functions. Le fichier `_routes.json` fait passer uniquement `/api/fidelity/*` par les Functions ; les autres pages restent statiques. Le dossier `.git`, les fichiers SQL et les secrets ne sont PAS copiés dans `dist`.

Sur le forfait gratuit, dans **Pages → Settings → Runtime → Fail open / closed**, choisir **Fail closed** pour ne pas servir des accès non protégés lorsque les limites de Functions sont dépassées.

### 6. Fonctionnement

- `fidelity-files/fidelity.html` : inscription prénom/nom/téléphone/email + mot de passe ; connexion depuis tout navigateur ; cookie de session `Secure`, `HttpOnly`, `SameSite=Strict` (30 jours), QR code téléchargeable et total de points.
- `fidelity-files/scan-fidelity.html` : lien discret après Confidentialité ; mot de passe **vérifié côté serveur** ; logo vibrant durant la vérification ; caméra avec permission explicite ou image de remplacement ; confirmation humaine puis `+1` point.
- Une même carte ne peut recevoir **qu'un point toutes les 10 minutes** (évite les scans répétés accidentels). Ce délai est dans la Function (`now-600`). Le personnel ne peut pas définir arbitrairement le nombre de points via le navigateur.
- Les codes QR contiennent un token aléatoire de 256 bits, **aucune information personnelle**. Une capture d'écran du QR reste partageable : l'agent doit vérifier la présence réelle du client.
- Noms, téléphone et email sont chiffrés en AES-256-GCM, avec IV aléatoire unique. Index d'email = HMAC (clé privée). Les mots de passe sont **hachés**, et non chiffrés de façon réversible, avec PBKDF2-HMAC-SHA256 à 600 000 itérations, sel aléatoire et poivre serveur.
- Comptes et récompenses sont en D1 ; sauvegarde régulière, procédure de restauration et politique de suppression à définir.

### 7. Limites et durcissement à prévoir avant d'ouvrir à grande échelle

**Aucun code n'est garanti sans faille.** Ce projet a des garde-fous réels, mais doit être testé en déploiement avant d'accepter des données personnelles réelles.

1. Configurer des règles **WAF/rate limiting** Cloudflare supplémentaires pour `/api/fidelity/*`, en particulier `/login`, `/register`, `/forgot` et `/admin/login`. Une limitation D1 côté serveur de 6 erreurs / 15 minutes est déjà fournie pour les connexions ; le WAF arrête le trafic anormal en amont. Un ajout Cloudflare Turnstile, validé **côté serveur**, est recommandé si les abus augmentent.
2. Protéger la page agent avec **Cloudflare Access** (deuxième barrière) si possible. Le lien discret n'est **pas une protection** : tout internaute peut charger le HTML de connexion, mais les fonctions d'administration restent interdites sans authentification.
3. Effectuer de vrais essais sur téléphone (Android + iPhone), sur HTTPS, avec autorisation caméra et refus de permission. Les bibliothèques QR sont chargées à la demande depuis jsDelivr, à versions épinglées ; contrôler régulièrement leurs vulnérabilités et envisager de les héberger localement avec intégrité vérifiée.
4. Définir une procédure de sauvegarde, de suppression sur demande, de restauration des clés et de changement des mots de passe des agents. La confidentialité du site a été étendue pour mentionner le programme.
5. **Déploiement test :** vérifier inscription, connexion, deuxième appareil, déconnexion, caméra, scan, double scan (rejeté), scan non-Wizer (rejeté), session agent absente (401), réinitialisation par email, points affichés et réapparition après nouvelle connexion.
6. Vérifier que `https://wizer-kin.com/.git/HEAD` et `https://wizer-kin.com/database/fidelity_schema.sql` ne divulguent aucun contenu privé.

## Seuils de récompenses : idées, pas encore activées

- 5 visites : petite retouche ou soin complémentaire.
- 10 visites : réduction à définir (ex. 10 %) sur une prestation.
- 15 visites : soin découverte offert sous conditions.

Aucune récompense ne peut être automatiquement utilisée dans cette version : le système ne fait pour l'instant qu'**enregistrer les points et préparer les types de récompenses**.
