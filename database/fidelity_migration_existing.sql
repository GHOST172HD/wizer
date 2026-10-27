-- À exécuter UNIQUEMENT sur une base D1 qui possède déjà la table clients.
-- Les empreintes créées par une ancienne version utilisaient 600 000 itérations.
-- Si des comptes existaient, ils devront réinitialiser leur mot de passe, car
-- le runtime Workers plafonne actuellement PBKDF2 à 100 000.
ALTER TABLE clients ADD COLUMN mot_de_passe_iterations INTEGER NOT NULL DEFAULT 600000;
-- Les nouveaux comptes sont explicitement créés avec 100000 par l’API.
