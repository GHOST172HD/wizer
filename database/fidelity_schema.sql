-- Wizer fidélité — modèle logique relationnel issu du MCD Merise.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  email_index TEXT NOT NULL UNIQUE,
  prenom_chiffre TEXT NOT NULL,
  nom_chiffre TEXT NOT NULL,
  telephone_chiffre TEXT NOT NULL,
  email_chiffre TEXT NOT NULL,
  mot_de_passe_sel TEXT NOT NULL,
  mot_de_passe_empreinte TEXT NOT NULL,
  mot_de_passe_iterations INTEGER NOT NULL DEFAULT 100000 CHECK(mot_de_passe_iterations BETWEEN 1 AND 1000000),
  qr_code TEXT NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK(total_points >= 0),
  cree_le INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  identifiant_hash TEXT PRIMARY KEY,
  type_session TEXT NOT NULL CHECK(type_session IN ('client','agent')),
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  expire_le INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiration ON sessions(expire_le);
CREATE TABLE IF NOT EXISTS mouvements_points (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type_mouvement TEXT NOT NULL CHECK(type_mouvement IN ('gain','utilisation','ajustement')),
  quantite INTEGER NOT NULL CHECK(quantite != 0),
  cree_le INTEGER NOT NULL,
  operation_id TEXT NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_points_client_date ON mouvements_points(client_id, cree_le DESC);
CREATE TABLE IF NOT EXISTS recompenses (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  points_requis INTEGER CHECK(points_requis IS NULL OR points_requis > 0),
  active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1))
);
CREATE TABLE IF NOT EXISTS utilisations_recompenses (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recompense_id TEXT NOT NULL REFERENCES recompenses(id),
  mouvement_id TEXT REFERENCES mouvements_points(id),
  cree_le INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS reinitialisations (
  jeton_hash TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  expire_le INTEGER NOT NULL,
  utilise_le INTEGER
);
CREATE TABLE IF NOT EXISTS tentatives_connexion (
  cle_hash TEXT PRIMARY KEY,
  nombre INTEGER NOT NULL,
  debut_fenetre INTEGER NOT NULL
);
-- Idées conservées, mais non activées et sans seuil tant qu'il n'est pas choisi.
INSERT OR IGNORE INTO recompenses (id, titre, description, points_requis, active) VALUES
 ('soin-offert', 'Soin découverte offert', 'Une prestation découverte selon les disponibilités.', NULL, 0),
 ('reduction', 'Réduction fidélité', 'Remise sur une future prestation, montant à décider.', NULL, 0),
 ('upgrade', 'Surclassement de prestation', 'Un supplément de soin offert avec une prestation.', NULL, 0);
