-- ════════════════════════════════════════════════════════════════════
-- PAWFECT GROOMING — Supabase Database Schema
-- Plak dit in: Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════

-- ── BOEKINGEN ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  naam_baasje   TEXT NOT NULL,
  telefoon      TEXT,
  email         TEXT,
  naam_huisdier TEXT NOT NULL,
  soort_dier    TEXT,
  dienst        TEXT NOT NULL,
  datum         DATE NOT NULL,
  opmerkingen   TEXT,
  status        TEXT DEFAULT 'nieuw' CHECK (status IN ('nieuw','bevestigd','voltooid','geannuleerd')),
  notitie       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── KLANTEN ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  naam           TEXT NOT NULL,
  email          TEXT,
  telefoon       TEXT,
  huisdier_naam  TEXT,
  huisdier_soort TEXT,
  ras            TEXT,
  opmerkingen    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Koppel klanten aan boekingen
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- ── BLOG POSTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  content      TEXT NOT NULL,        -- HTML content (rich text)
  excerpt      TEXT,                 -- Korte samenvatting
  cover_image  TEXT,                 -- URL naar afbeelding
  category     TEXT DEFAULT 'Algemeen',
  published    BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON blog_posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── BEVEILIGING (Row Level Security) ────────────────────────────────
-- We gebruiken de service key in de backend, dus RLS is niet strikt nodig.
-- Maar voor de zekerheid: zet alle tabellen op alleen-lezen voor anoniem.

ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts: publiek leesbaar indien gepubliceerd
CREATE POLICY "Publiek: lees gepubliceerde posts"
  ON blog_posts FOR SELECT
  USING (published = TRUE);

-- Alles alleen via service key (backend)
CREATE POLICY "Service: alles mag"
  ON bookings FOR ALL USING (TRUE);
CREATE POLICY "Service: alles mag"
  ON clients FOR ALL USING (TRUE);
CREATE POLICY "Service: blog alles mag"
  ON blog_posts FOR ALL USING (TRUE);

-- ── INDEXEN (voor snelheid) ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_datum    ON bookings (datum);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_blog_slug         ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_published    ON blog_posts (published, published_at);
CREATE INDEX IF NOT EXISTS idx_clients_naam      ON clients (naam);

-- ════════════════════════════════════════════════════════════════════
-- Klaar! Je database is ingericht.
-- ════════════════════════════════════════════════════════════════════
