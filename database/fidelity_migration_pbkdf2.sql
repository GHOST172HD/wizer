
ALTER TABLE clients ADD COLUMN mot_de_passe_iterations INTEGER NOT NULL DEFAULT 600000
  CHECK(mot_de_passe_iterations BETWEEN 1 AND 1000000);
