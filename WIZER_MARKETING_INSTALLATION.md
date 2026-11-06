# Wizer V7 — Module Marketing / Fidelity

## Ce qui a été ajouté

- **Accès réservé aux agents** : scanner Fidelity → bouton **Écrire aux clientes · Marketing**, ou `/fidelity-files/marketing-fidelity.html` avec le même mot de passe agent.
- **Rédacteur simple** : objet + texte, variables `{{prenom}}`, `{{nom}}`, `{{points}}`, liens HTTPS automatiques, bouton « Découvrir Wizer » configurable, aperçu fictif.
- **Envoi personnalisé** via les secrets Resend déjà en place (`RESEND_API_KEY`, `FIDELITY_EMAIL_FROM`). Chaque email est adressé individuellement, avec un lien personnel de désabonnement.
- **Suivi** des envois : envoyés, en attente, en échec, ignorés ; traitement en petits lots via Cron Cloudflare toutes les 5 minutes.
- **Consentement facultatif** à l'inscription (case non précochée) et réglage modifiable dans la carte Fidelity. Aucune cliente existante n'est abonnée automatiquement.

## Important : D1 et clients existants

**Aucune table Fidelity existante n'est effacée ou modifiée par le nouveau SQL.**
La migration crée seulement `marketing_preferences`, `marketing_campaigns` et `marketing_deliveries` et leurs index. Les anciens comptes, QR, points, sessions et secrets ne sont pas remplacés.

**Ne lancez pas** `database/fidelity_schema.sql`, ni `database/fidelity_migration_existing.sql`, ni `database/fidelity_migration_pbkdf2.sql` sur la base de production pour installer ce module.
**N'utilisez pas** `wrangler d1 execute --local` si vous voulez modifier la vraie base : utiliser `--remote`.

### Ordre d'installation recommandé (PowerShell sous Windows)

Ouvrez PowerShell à la racine du dépôt Wizer, là où se trouve `wrangler.jsonc`.

1. **Faites une nouvelle sauvegarde D1 indépendante avant toute migration** :

   ```powershell
   New-Item -ItemType Directory -Force -Path "D:\WIZER-SECURE-BACKUPS"
   npx.cmd wrangler d1 export wizer-fidelity --remote --output="D:\WIZER-SECURE-BACKUPS\wizer-fidelity-avant-marketing.sql"
   ```

   Gardez cette sauvegarde hors de GitHub et stockez vos secrets séparément et de façon sécurisée.

2. **Ajoutez les trois nouvelles tables (opération additive/idempotente)** :

   ```powershell
   npx.cmd wrangler d1 execute wizer-fidelity --remote --file=./database/marketing_migration.sql
   ```

3. **Vérifiez que les nouvelles tables et les clients existants sont toujours présents** :

   ```powershell
   npx.cmd wrangler d1 execute wizer-fidelity --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('clients','marketing_preferences','marketing_campaigns','marketing_deliveries') ORDER BY name;"
   npx.cmd wrangler d1 execute wizer-fidelity --remote --command="SELECT COUNT(*) AS clients_existants FROM clients;"
   ```

4. **Déployez ce dépôt** selon votre flux existant Cloudflare Workers, qui exécute `sh build-cloudflare.sh` puis `npx wrangler deploy` (ou automatiquement via votre dépôt connecté). `wrangler.jsonc` conserve le même Worker `wizer`, la même D1 et la même liaison `FIDELITY_DB`. Aucun nouveau domaine nécessaire.

5. **Vérifiez l'activation du Cron** : Cloudflare Workers → `wizer` → Triggers → Cron : `*/5 * * * *`. Les cron jobs existent uniquement après le déploiement avec `wrangler.jsonc`.

6. **Essai avec un compte test consentant**, sans envoyer immédiatement à toute la base :
   - Connectez-vous sur `/fidelity-files/fidelity.html` avec votre compte de test, et cochez les offres dans « Mes préférences email ».
   - Allez à l'accès agent du scanner, puis à **Wizer Marketing**. Vérifiez les statistiques.
   - Rédigez un message et observez l'aperçu avant de cliquer sur « Envoyer ».
   - Le bouton **Envoyer** lance une vraie campagne vers **tous les comptes abonnés**, pas un test isolé. Vérifiez le nombre d'abonnés avant de confirmer.
   - Contrôlez le suivi et le lien de désabonnement reçu par votre compte test.

### Gestion des campagnes

- Une campagne ne peut **pas être annulée après le lancement** dans cette première version. Vérifiez l'objet, le texte, les liens, le nombre de destinataires et le contexte avant de confirmer.
- Les comptes non consentants (dont **tous les comptes historiques**, tant qu'ils n'activent pas eux-mêmes les offres) ne reçoivent pas de promotions.
- Les réinitialisations de mot de passe restent fonctionnelles indépendamment de la publicité.
- `{{prenom}}`, `{{nom}}` et `{{points}}` sont remplacés dans l'objet et le message au moment de l'envoi.
- Pour les liens au milieu du texte, collez des URLs complètes commençant par `https://` ; elles deviennent cliquables dans l'email. Le bouton en dessous dispose de son propre texte et URL.
- Les envois utilisent l'API transactionnelle `/emails` de Resend avec un identifiant d'idempotence par campagne et cliente. Les quotas et limitations de votre formule Resend s'appliquent. Des échecs peuvent être visibles dans le tableau de suivi ; ils ne signifient pas que les emails ont été reçus ou ouverts.
- Les envois sont **mis en attente** à la création et traités ensuite par Cloudflare. Le statut « envoyé » signifie accepté par l'API Resend, pas garanti livré dans la boîte de réception.

### Politique du consentement

Une case précochée pour la prospection commerciale ne constitue pas une preuve robuste d'accord préalable. Le Code du numérique de la RDC (art. 68, et exceptions spécifiques art. 69) exige normalement un accord préalable ; la case reste donc **facultative, décochée**. Le client peut l'activer ensuite depuis sa carte ; chaque email inclut un lien de désabonnement. Les anciens comptes ne sont pas automatiquement abonnés.

- Source officielle : https://droitnumerique.cd/code-du-numerique-congolais-rdc-pdf/livre-premier-titre-viii/
- Documentation Cron : https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Resend : https://resend.com/docs/dashboard/emails/idempotency-keys

## Sécurité et vérifications

- Le code de l'API marketing reste dans `functions/`, **hors** `dist/`.
- Le code JS public n'expose **aucune clé API** ni nom/email de clients ; tout accès aux données exige une session.
- Les coordonnées demeurent chiffrées dans la base, comme dans Fidelity V7.
- Les autres secrets (`FIDELITY_ENC_KEY`, `FIDELITY_INDEX_KEY`, `FIDELITY_PEPPER`, `FIDELITY_ADMIN_PASSWORD`) **ne doivent pas être changés** pour cette mise à jour.
- Aucun accès au compte D1 réel, aucune sauvegarde distante et aucun test réel d'envoi n'ont été effectués lors de la création de cette archive. Les tests locaux utilisent une base SQLite mémoire et une imitation de Resend.
- Tester le nouveau module en environnement contrôlé et vérifier les quotas, le Cron et la configuration sur Cloudflare avant une campagne de production.

## Tests locaux

```powershell
node --experimental-sqlite tests/integration.mjs
node --experimental-sqlite tests/marketing.mjs
sh build-cloudflare.sh
```
