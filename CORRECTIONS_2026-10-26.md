# Wizer — Rapport des corrections du 26 octobre 2026

Référence : `Wizer_Fidelity_Workers_ADAPTE.zip`. Les modifications sont **locales au projet livré** ; aucune action n'a été effectuée sur le dépôt GitHub ou Cloudflare en production.

## Problèmes traités

| Rapport | Travail réalisé | Remarque |
|---|---|---|
| 1. PBKDF2 / Workerd | PBKDF2 ramené à 100 000 itérations ; coût enregistré par client (`mot_de_passe_iterations`), schéma + migration D1 | **Compromis sécurité/compatibilité** : sous le minimum OWASP de 600 000. Laisser le pepper secret et envisager Argon2id. Les comptes hérités à 600 000 devront réinitialiser leur mot de passe. |
| 2. QR photo / CSP | `blob:` autorisé dans `img-src` de `_headers` | Contrôler la réponse HTTP déployée et tester l'import réel |
| 3. Carrousel | Jointure sans saut de `gap` (marges identiques dans chaque copie) ; affichage fixe disposé en grille si « réduire les animations » | La préférence d'accessibilité de l'utilisateur est respectée |
| 4. Menu mobile | Ferme sur lien / extérieur / Échap ; `aria-expanded` et `aria-label` synchronisés ; style vert limité à `.salon-open` | Préserve l'animation hamburger existante |
| 5. Horaires | `Intl.DateTimeFormat` avec `Africa/Kinshasa` | Validé par tests de dates à travers les fuseaux |
| 6. Distance | Affichage mètres / km avec virgule et ± précision ; masque la distance chiffrée si incertitude > 1 km | La carte indique toujours une distance à vol d'oiseau |
| 7. Carte | Supprime les tailles de tuiles imposées à 256 px et répare l'ordre de grille en desktop | Fond Esri conservé pour ne pas risquer de casser la carte ; fond OSM en secours |
| 8. Services | Valeurs de réservation uniques « catégorie — service », y compris les trois « Autre » | Les liens « Réserver » de la liste utilisent la même valeur |
| 9. Galerie | Ajoute les descriptions `alt`/`title` génériques, le style des badges et un message d'embed plus professionnel | Les textes peuvent être affinés manuellement image par image |
| 10. Copyright | Année remplie automatiquement par `js/main.js` sur les 9 pages publiques | — |
| 11. Métadonnées | Lien Fidélité dans les neuf menus, favicon uniforme, descriptions, `sitemap.xml` et `robots.txt` | Les deux pages fidélité conservent leur propre favicon |
| 12. Fichiers publics | Build exclut sauvegarde du logo, photos inutilisées connues, `database`, `functions`, `worker` et `.git` ; supprime les deux faux salons inactifs | Ne pas servir le répertoire de travail comme racine publique |
| 13. Ancien hébergement | Supprime `netlify.toml` et `_routes.json` | Vérifier que le compte Netlify historique n'est plus connecté |
| 15. API | 400 pour JSON invalide, 413 si >8 Kio, limite d'échecs par email + IP au lieu d'une IP seule, nettoyage des entrées périmées, « mot de passe oublié » exécuté hors temps de réponse sur Workers, suppression de compte sécurisée | Reste à créer des comptes agent distincts pour tracer précisément les points |
| 16. Documentation | README, guide Fidélité et descriptions légales corrigés pour Cloudflare **Workers** ; texte de conservation cassé et numérotation réparés | Les données juridiques (RCCM/NIF/retentions réelles) nécessitent confirmation de l'exploitant |
| Détails | Repositionne l'en-tête, refuse les dates passées et heures hors ouverture pour le formulaire WhatsApp | Le bouton Gmail reste un choix existant, pas un défaut de sécurité |

## À ne pas présenter comme corrigé

**Bibliothèques QR tierces (point 14).** `qrcodejs@1.0.0` et `html5-qrcode@2.3.8` sont toujours chargées depuis jsDelivr, sans copie locale ni SRI. Cette version n'introduit pas de hash SRI inventé : il faudrait récupérer les fichiers officiels, en contrôler l'empreinte, les tester puis les embarquer localement. **Ce risque n'est pas levé.** Aucun avis direct connu dans Snyk pour `html5-qrcode@2.3.8` au moment de la consultation n'est une garantie d'absence de faille.

**Un seul mot de passe agent.** La session agent ne permet toujours pas d'identifier quel employé a attribué un point. Avant usage multi-agent, prévoir un compte et un journal d'audit par employé. Une page secrète ne remplace jamais l'authentification.

**Carte / données légales.** Les règles d'utilisation des tuiles Esri et OSM, l'absence éventuelle d'étiquettes de rue, la future migration cartographique ainsi que les mentions légales nécessitent encore validation en situation réelle.

**Aucune évaluation de sécurité exhaustive, aucun test Workerd/Cloudflare réel.** Les tests Node ne prouvent pas le fonctionnement du service dans l'environnement Cloudflare. Ne pas promettre « zéro faille ».

## Ordre d'installation recommandé (sans casser `wizer-kin.com`)

1. **Ne remplace pas le `wrangler.jsonc` de GitHub par celui de l'archive sans préserver le `database_id` réel.** Le fichier ZIP de référence contient `REMPLACER_PAR_ID_D1`.
2. Sauvegarde ta base D1. Si tu as **déjà créé les tables** avec l'ancien SQL, exécute **une seule fois** :

   ```bash
   npx wrangler d1 execute wizer-fidelity --remote --file=database/fidelity_migration_existing.sql
   ```

   Si D1 est **encore vide**, exécute à la place `database/fidelity_schema.sql`. **Ne pas lancer les deux scripts sur la même base neuve.**
3. Intègre uniquement les fichiers modifiés dans le dépôt, vérifie l'ID D1 existant, puis lance le build et le déploiement Cloudflare Workers.
4. Vérifie la réussite de **`npx wrangler deploy`**, et non seulement celle de `sh build-cloudflare.sh`.
5. Contrôle `/.git/HEAD` et `/database/fidelity_schema.sql` : 404/403, jamais des données internes.
6. Teste de bout en bout inscription, mail de réinitialisation, QR, scanner par photo/caméra, +1 point, anti-doublon, accès agent et suppression d'un compte test.
7. Avant d'ouvrir à de vrais clients : compléter les informations juridiques, choisir une stratégie de bibliothèques QR locales, et prévoir l'identification des agents.

## Vérifications réalisées localement

- `node --experimental-sqlite tests/integration.mjs` : OK (authentification, points, anti-doublon, chiffrement, suppression, 400/413, CSRF).
- `node --check` : syntaxe JavaScript, OK.
- `sh build-cloudflare.sh` : OK. Les 34 références d'actifs testées existent dans `dist` et aucun fichier privé ne s'y trouve.
- Calcul des horaires avec une date d'essai côté Kinshasa : OK.
- Chromium headless : le lancement dans cet environnement a expiré ; **le rendu visuel et la caméra ne sont pas validés**.
