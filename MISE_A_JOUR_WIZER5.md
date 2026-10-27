# Wizer(5) — Correctifs ciblés du 27 octobre 2026

Ces fichiers sont dérivés **exclusivement** de `wizer(5).zip`, non de l'ancien ZIP corrigé.

## IMPORTANT — ordre des opérations

1. Sauvegarder la base D1 `wizer-fidelity` si elle contient des données.
2. **Si les tables D1 n'existent pas encore :** importer `database/fidelity_schema.sql` :

   `npx wrangler d1 execute wizer-fidelity --remote --file=database/fidelity_schema.sql`

3. **Si la table `clients` existe déjà et n'a PAS la colonne `mot_de_passe_iterations` :** importer **à la place**, UNE SEULE FOIS, `database/fidelity_migration_pbkdf2.sql` :

   `npx wrangler d1 execute wizer-fidelity --remote --file=database/fidelity_migration_pbkdf2.sql`

   La migration marque les **anciens comptes** à 600 000 itérations. Ces comptes nécessitent une réinitialisation par email : ne jamais falsifier cette valeur en la changeant directement à 100 000. Si la colonne existe déjà, ne rejoue pas la migration.

4. Copier les fichiers du correctif dans le dépôt `GHOST172HD/wizer`, aux mêmes chemins.
5. **Ne remplace PAS `wrangler.jsonc` déjà configuré avec le vrai Database ID** par celui de l'archive source. Dans TON fichier `wrangler.jsonc` de GitHub, conserve `name`, `main`, `assets`, `d1_databases` et le vrai `database_id`, puis ajoute à la racine cet objet (avec une virgule appropriée entre les objets) :

   `"triggers": { "crons": ["23 3 * * *"] }`

   Ainsi Cloudflare appelle une fois par jour la nouvelle méthode `scheduled()` de `worker/index.js` pour purger les données expirées. Fuseau : UTC. Si tu utilises l'archive complète, le `wrangler.jsonc` de cette archive contient encore `REMPLACER_PAR_ID_D1` : remplace-le **avant** tout déploiement.

6. Avec le Worker `wizer` connecté à GitHub :

   - Build : `sh build-cloudflare.sh`
   - Déploiement : `npx wrangler deploy`
   - Branche : `main`

7. Tester en production : inscription, connexion, mot de passe oublié, scan par image, compte supprimé, en-tête CSP réel, et Cron D1. Ne pas utiliser de véritables données clients avant ce test. Le test Node ne valide pas à lui seul Cloudflare.

## Correctifs couverts

- PBKDF2 fixé à 100 000 itérations pour les nouveaux comptes, coût par client en base, réinitialisations mises à jour.
- `img-src blob:` dans `_headers` pour les imports de photos QR.
- `data-year` alimenté sur les neuf pages principales par `js/main.js`.
- Meta descriptions sur six pages publiques manquantes.
- `400` pour JSON mal formé, `413` au-delà de 8 Kio, y compris requêtes sans Content-Length.
- Purge planifiée des sessions, tentatives et réinitialisations expirées.
- Endpoint client `POST /api/fidelity/account/delete` avec session, confirmation de mot de passe et suppression des tables associées ; bouton disponible sur la page Fidelity.
- Documentation et politique de confidentialité mises à jour.

## Limites

- L'ancien coût PBKDF2 (600 000) n'est pas vérifiable dans les versions de workerd qui plafonnent à 100 000 : la récupération par email doit être configurée pour les comptes hérités.
- Les sauvegardes Cloudflare et les copies externes suivent leurs propres règles de rétention ; suppression de la base active ne signifie pas effacement instantané de toute sauvegarde.
- Le chiffrement et la sécurité ne peuvent pas être garantis uniquement avec des tests Node. Les nouveaux secrets ne sont pas fournis et ne doivent jamais être mis sur GitHub.
