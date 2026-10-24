# Wizer Fidelity — raccorder D1 au Worker existant

Ce dépôt est adapté à **Cloudflare Workers avec actifs statiques**. Il garde l’application **`wizer`** et les fichiers publics du site dans `dist`. Le code de l’API Fidelity reste privé dans `functions/` et est importé par `worker/index.js`, sans être copié dans `dist`.

## À faire exactement, dans cet ordre

1. Sur le tableau de bord Cloudflare : **Stockage et bases de données → D1 → `wizer-fidelity`**. Copie l’**identifiant de base de données** (`Database ID`), un UUID.
2. Dans le dépôt GitHub `GHOST172HD/wizer`, à la racine, ouvre **`wrangler.jsonc`** et remplace **`REMPLACER_PAR_ID_D1`** par ce véritable identifiant. **Ne change pas** `name: wizer`, `binding: FIDELITY_DB`, ni `database_name: wizer-fidelity`.
3. Ajoute au dépôt **`worker/index.js`**, **`wrangler.jsonc`**, et les autres fichiers de cette version. **N’envoie pas le dossier `dist/`** : il est généré au déploiement. **Ne téléverse jamais `.git/`, les secrets ou les fichiers SQL dans le dossier public**.
4. Dans Cloudflare → **Workers et Pages → wizer → Paramètres → Compilations**, configure :
   - **Commande de compilation** : `sh build-cloudflare.sh`
   - **Commande de déploiement** : `npx wrangler deploy`
   - **Dossier racine** : racine du dépôt contenant `wrangler.jsonc`
   Si le tableau de bord affiche les contrôles différemment, vérifie que le build crée bien `dist/` **avant** le déploiement Wrangler.
5. Pousse un commit ; attends la réussite du déploiement. Dans **Paramètres → Liaisons**, tu devrais voir **`FIDELITY_DB` → `wizer-fidelity`**. Il est normal que le projet n’apparaisse plus comme « fichiers statiques uniquement », puisqu’il possède désormais `worker/index.js`.
6. Dans **Paramètres → Variables d’exécution et secrets** de la même application `wizer`, configure en **secrets** : `FIDELITY_ADMIN_PASSWORD`, `FIDELITY_PEPPER`, `FIDELITY_ENC_KEY`, `FIDELITY_INDEX_KEY` (voir `FIDELITY_SETUP.md`). Ces valeurs ne doivent jamais figurer dans un fichier Git.
7. La base D1 est **vide** tant que son schéma n’a pas été importé. Sur ton PC dans le dossier du dépôt, après authentification Wrangler :

   ```sh
   npx wrangler d1 execute wizer-fidelity --remote --file=database/fidelity_schema.sql
   ```

   Tu peux également importer le SQL dans la console D1 du tableau de bord. Ne lance pas le programme pour de vrais clients sans vérifier l’existence des tables et configurer la réinitialisation email.
8. Vérifications à faire sur `https://wizer-kin.com` : le site classique et ses images, `/fidelity-files/fidelity.html`, la page de scan, puis `/api/fidelity/config` (après configuration). Avant les secrets, une réponse **503** de l’API est volontaire : les comptes restent désactivés. Teste inscription, connexion, scan, double scan bloqué et emails sur un compte de démonstration.

## Points de sécurité

- La route `/api/fidelity/*` utilise **le script Worker côté serveur**. La liaison D1 n’est jamais exposée directement au navigateur.
- Toutes les autres routes sont servies par `env.ASSETS.fetch(request)` ; pas de seconde application Cloudflare ni de migration de domaine.
- `wrangler.jsonc` est la **source de vérité** des liaisons. Si tu remplaces la base ou modifies sa liaison, mets ce fichier à jour avant le prochain déploiement.
- `build-cloudflare.sh` exclut la base SQL, `.git` et `functions/` de `dist/`. Vérifie quand même le résultat en production.
- Le dépôt utilise `keep_vars: true` pour préserver les variables configurées par le tableau de bord ; les secrets ne sont jamais mis dans Git.
- N’ouvre pas le système public avant d’avoir testé le flux complet sur Cloudflare. Aucun test local ne garantit l’absence de faille.

Documentation Cloudflare :
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/d1/get-started/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
