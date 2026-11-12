-- Wizer Marketing - migration ADDITIVE pour D1 existante.
-- Exécuter UNE fois en distant avec wrangler d1 execute --remote.
-- Ne supprime ni ne modifie les comptes fidélité, les sessions, les points, les QR ou les secrets.
CREATE TABLE IF NOT EXISTS marketing_preferences (
 client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
 subscribed INTEGER NOT NULL DEFAULT 0 CHECK(subscribed IN (0,1)),
 subscribed_at INTEGER,
 unsubscribed_at INTEGER,
 source TEXT NOT NULL DEFAULT 'compte'
);

CREATE INDEX IF NOT EXISTS idx_marketing_consent ON marketing_preferences(subscribed);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
 id TEXT PRIMARY KEY,
 subject TEXT NOT NULL,
 message TEXT NOT NULL,
 button_label TEXT NOT NULL,
 button_url TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','completed')),
 created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_deliveries (
 campaign_id TEXT NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
 client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent','skipped','failed')),
 attempts INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL,
 retry_at INTEGER NOT NULL DEFAULT 0,
 last_error TEXT,
 PRIMARY KEY (campaign_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_marketing_pending ON marketing_deliveries(state,retry_at);
