# Wizer Fidelity — installation, sécurité et exploitation

> **Attention : cette version tourne sur Cloudflare Workers, pas Cloudflare Pages Functions.** Pour les instructions actuelles de liaison D1 et de déploiement, lis en priorité **`WORKERS_DEPLOYMENT.md`**. Les instructions « Pages → Bindings » ci-dessous étaient destinées à l’ancienne architecture et ne doivent pas être suivies pour le Worker `wizer`.

## Avant toute mise en ligne

**Les deux pages sont développées, mais le système ne fonctionnera PAS tant que la base D1, les secrets et le Worker Cloudflare ne sont pas configurés.** En l'absence des secrets, les API renvoient `503`, sans créer ni attribuer des points. Il s'agit d'une mesure volontaire de sécurité.

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

Ensuite, dans **Workers et Pages → wizer → Paramètres → Liaisons**, après déploiement du script Worker :

- **Variable name : `FIDELITY_DB`** (respecte majuscules)
- Choisir la base `wizer-fidelity`.

Redéployer ensuite. Ne publie pas le fichier SQL dans `dist`.

### 3. Définir le mot de passe agent (c'est ici)

Dans **Workers et Pages → wizer → Paramètres → Variables et secrets**, créer des **Secrets**, pas des variables publiques :

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

### 5. Construire et publier sur Cloudflare Workers

Le dépôt GitHub est connecté au Worker `wizer`. Conserver les paramètres :

- **Commande de build : `sh build-cloudflare.sh`** (produit les ressources publiques dans `dist`).
- **Commande de déploiement : `npx wrangler deploy`**.
- **Répertoire racine : `/`** lorsque les fichiers sont à la racine du dépôt.
- Le Worker est déclaré dans `wrangler.jsonc` (`main: ./worker/index.js`) et le répertoire de ressources publiques est `dist` (`assets.directory`).

Le script serveur `functions/api/fidelity/[[path]].js` est importé par `worker/index.js` et n'est **pas copié** dans `dist`. Ne pas confondre avec les Pages Functions : le dossier `functions/` n'est pas automatiquement exécuté par ton Worker statique.

Pour la purge, `wrangler.jsonc` doit aussi contenir `"triggers": {"crons": ["23 3 * * *"]}`. Préserve impérativement la **vraie valeur de `database_id`** déjà renseignée dans ton dépôt.

Le dossier `.git`, le SQL, les tests et les secrets ne doivent jamais être copiés dans `dist`. En cas d'échec de compilation ou de déploiement, consulter les logs : la version active peut rester la version précédente.

### 6. Fonctionnement

- `fidelity-files/fidelity.html` : inscription prénom/nom/téléphone/email + mot de passe ; connexion depuis tout navigateur ; cookie de session `Secure`, `HttpOnly`, `SameSite=Strict` (30 jours), QR code téléchargeable et total de points.
- `fidelity-files/scan-fidelity.html` : lien discret après Confidentialité ; mot de passe **vérifié côté serveur** ; logo vibrant durant la vérification ; caméra avec permission explicite ou image de remplacement ; confirmation humaine puis `+1` point.
- Une même carte ne peut recevoir **qu'un point toutes les 10 minutes** (évite les scans répétés accidentels). Ce délai est dans la Function (`now-600`). Le personnel ne peut pas définir arbitrairement le nombre de points via le navigateur.
- Les codes QR contiennent un token aléatoire de 256 bits, **aucune information personnelle**. Une capture d'écran du QR reste partageable : l'agent doit vérifier la présence réelle du client.
- Noms, téléphone et email sont chiffrés en AES-256-GCM, avec IV aléatoire unique. Index d'email = HMAC (clé privée). Les mots de passe sont **hachés**, et non chiffrés de façon réversible, avec PBKDF2-HMAC-SHA256 à 100 000 itérations pour les nouveaux comptes, coût enregistré dans `clients.mot_de_passe_iterations`, sel aléatoire et poivre serveur. Ce coût constitue un compromis imposé par la limite historique de workerd, inférieur aux recommandations OWASP pour PBKDF2-SHA256.
- Comptes et récompenses sont en D1 ; la suppression de compte est disponible sur la page Fidelity. Prévoir également les sauvegardes et la gestion de leur durée de conservation.

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

## Mise à niveau ciblée `wizer(5)` (27 octobre 2026)

**Avant de déployer le Worker :**

- **Base D1 neuve, sans table `clients` :** exécuter `database/fidelity_schema.sql`.
- **Base D1 déjà créée avec l'ancien schéma :** faire une sauvegarde, puis exécuter **une seule fois** `database/fidelity_migration_pbkdf2.sql` avant de publier l'API mise à jour. Ne pas recréer les tables et ne pas exécuter les deux scripts indistinctement.
- Ne pas copier le `database_id` fictif `REMPLACER_PAR_ID_D1` de l'archive sur le `wrangler.jsonc` déjà correctement configuré dans GitHub. Appliquer la nouvelle propriété `triggers` à ton fichier existant.
- Les anciens comptes dont le hachage a été calculé à **600 000** itérations ne peuvent pas être vérifiés par la limite PBKDF2 de workerd. Ils restent identifiés avec `mot_de_passe_iterations = 600000` et devront utiliser **Mot de passe oublié** (Resend doit fonctionner), ce qui créera une nouvelle empreinte à 100 000. Ne jamais simplement changer la valeur en base à 100 000 pour ces comptes.
- Après migration, chaque nouvelle inscription ou réinitialisation sauvegarde `mot_de_passe_iterations = 100000`. Ce coût est limité côté Worker et pourra évoluer avec une future migration sécurisée.
- Le Worker exécute la purge automatique des sessions expirées, des jetons de réinitialisation expirés ou utilisés depuis plus d'un jour et des tentatives de connexion de plus de 15 minutes grâce au Cron `23 3 * * *` (UTC). La commande de déploiement reste `npx wrangler deploy`. Vérifier les événements Cron dans Cloudflare.
- Le client connecté peut effacer ses données avec le formulaire **Supprimer définitivement mon compte** (mot de passe requis) ; l'API `/api/fidelity/account/delete` supprime la carte, l'historique, les sessions et les jetons de réinitialisation de la base active. La restauration depuis des sauvegardes doit être encadrée séparément.
- Les corps JSON mal formés produisent 400, ceux de plus de 8 Ko produisent 413. L'import d'image QR utilise `blob:` dans `img-src` de `_headers`.
- L'année du pied de page est mise à jour automatiquement par `js/main.js` et des descriptions SEO ont été ajoutées aux six pages principales qui en manquaient.

**Nota :** les sections historiques de ce guide consacrées à Cloudflare Pages sont conservées à titre de référence, mais c'est `WORKERS_DEPLOYMENT.md` qui fait foi pour le Worker. Le projet doit être testé sur l'environnement Cloudflare réel après déploiement.
