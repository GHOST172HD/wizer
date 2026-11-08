# Wizer — Entrée unique pour les agents

Cette réorganisation concerne uniquement la navigation du personnel.

- `fidelity-files/agent.html` : écran de connexion unique, puis choix **Fidelity** ou **Marketing**.
- `fidelity-files/scan-fidelity.html` : scanner et attribution des points, accessible après connexion depuis l'accueil agent.
- `fidelity-files/marketing-fidelity.html` : éditeur, aperçu, envoi et suivi des campagnes, accessible après connexion depuis l'accueil agent.
- Bouton **Espace agent** sur chaque outil : retour au choix sans déconnexion.
- Bouton **Déconnexion** sur l'accueil agent : termine la session pour les deux outils.
- Toutes les entrées « Accès agent » du site public pointent désormais vers `fidelity-files/agent.html`.

Le cookie de session agent `wizer_staff` était déjà commun aux pages et protégé côté serveur (`HttpOnly`, `Secure`, `SameSite=Strict`), avec 8 heures de validité. Aucune modification des API, Workers, de Resend, des tables D1 ou des données clients.

**Déploiement :** remplacer les fichiers du site par le ZIP, puis suivre le même déploiement Worker que d'habitude. Ne pas relancer `fidelity_schema.sql` ni `marketing_migration.sql` si les tables sont déjà créées. La navigation ne nécessite aucune migration.
