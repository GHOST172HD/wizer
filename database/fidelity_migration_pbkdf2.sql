-- UNIQUEMENT si « clients » existait avant cette correction. Exécuter une seule fois.
-- Les empreintes précédentes avaient été générées avec 600 000 itérations.
-- Ne pas les déclarer à 100 000 : ces comptes devront réinitialiser leur mot de passe.
ALTER TABLE clients ADD COLUMN mot_de_passe_iterations INTEGER NOT NULL DEFAULT 600000
  CHECK(mot_de_passe_iterations BETWEEN 1 AND 1000000);
