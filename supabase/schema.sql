-- ─────────────────────────────────────────────────────────────────────────────
-- ToolCloud – Supabase Datenbankschema
-- Dieses Script im Supabase SQL Editor ausführen (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Erweiterungen aktivieren
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- Für Volltextsuche ohne Umlaute
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Für GIST-Index auf skalare Typen (UUID, Datum)


-- ─── ENUM-Typen ───────────────────────────────────────────────────────────────

CREATE TYPE item_category AS ENUM (
  'werkzeug', 'camping', 'musik', 'sport',
  'foto_video', 'kueche', 'garten', 'party'
);

CREATE TYPE booking_status AS ENUM (
  'requested', 'confirmed', 'completed', 'rejected', 'cancelled'
);


-- ─── USERS (Profildaten, ergänzt Supabase Auth) ───────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  location      TEXT,
  description   TEXT,
  rating        NUMERIC(3,2) DEFAULT 0 NOT NULL,
  review_count  INTEGER DEFAULT 0 NOT NULL,
  verified      BOOLEAN DEFAULT FALSE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Automatisch Profil anlegen wenn Nutzer sich registriert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Neuer Nutzer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─── ITEMS ────────────────────────────────────────────────────────────────────

CREATE TABLE items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  category      item_category NOT NULL,
  images        TEXT[] DEFAULT '{}' NOT NULL,
  price_per_day NUMERIC(8,2),   -- NULL = kostenlos
  deposit       NUMERIC(8,2),
  is_active     BOOLEAN DEFAULT TRUE NOT NULL,
  location      TEXT NOT NULL,
  lat           NUMERIC(9,6),
  lng           NUMERIC(9,6),
  rating        NUMERIC(3,2) DEFAULT 0 NOT NULL,
  review_count  INTEGER DEFAULT 0 NOT NULL,
  search_vector TSVECTOR,       -- Für Volltextsuche
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Volltextsuche: Suchindex aktuell halten
CREATE OR REPLACE FUNCTION update_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('german', unaccent(COALESCE(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('german', unaccent(COALESCE(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('german', unaccent(COALESCE(NEW.location, ''))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_search_vector_update
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_item_search_vector();

CREATE INDEX items_search_idx ON items USING GIN(search_vector);
CREATE INDEX items_owner_idx  ON items(owner_id);
CREATE INDEX items_category_idx ON items(category);


-- ─── BOOKINGS ─────────────────────────────────────────────────────────────────

CREATE TABLE bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id     UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      booking_status DEFAULT 'requested' NOT NULL,
  message     TEXT,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Keine überlappenden Buchungen für dasselbe Item (nur aktive)
  CONSTRAINT no_double_booking EXCLUDE USING GIST (
    item_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('requested', 'confirmed'))
);

CREATE INDEX bookings_item_idx     ON bookings(item_id);
CREATE INDEX bookings_borrower_idx ON bookings(borrower_id);
CREATE INDEX bookings_status_idx   ON bookings(status);


-- ─── REVIEWS ──────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id       UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Pro Buchung nur eine Bewertung
  UNIQUE (reviewer_id, booking_id)
);

-- Ø-Bewertung auf User + Item aktuell halten
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    rating       = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewed_user_id = NEW.reviewed_user_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = NEW.reviewed_user_id)
  WHERE id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();


-- ─── MESSAGES ─────────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX messages_receiver_idx ON messages(receiver_id, read);


-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────

ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: Jeder kann Profile lesen, nur eigenes bearbeiten
CREATE POLICY "Profiles sind öffentlich lesbar" ON users FOR SELECT USING (TRUE);
CREATE POLICY "Nutzer können ihr Profil bearbeiten" ON users FOR UPDATE USING (auth.uid() = id);

-- Items: Alle können lesen, nur Eigentümer schreiben
CREATE POLICY "Inserate sind öffentlich" ON items FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Eigentümer sieht alle eigenen" ON items FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Eigentümer kann schreiben" ON items FOR ALL USING (auth.uid() = owner_id);

-- Bookings: Nur beteiligte Parteien sehen Buchungen
CREATE POLICY "Buchungen nur für Beteiligte" ON bookings FOR SELECT
  USING (auth.uid() = borrower_id OR auth.uid() IN (
    SELECT owner_id FROM items WHERE id = item_id
  ));
CREATE POLICY "Ausleiher können Buchungen erstellen" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Beteiligte können Status ändern" ON bookings FOR UPDATE
  USING (auth.uid() = borrower_id OR auth.uid() IN (
    SELECT owner_id FROM items WHERE id = item_id
  ));

-- Reviews: Öffentlich lesbar, nur nach Buchung schreibbar
CREATE POLICY "Reviews sind öffentlich" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Nur Reviewer kann schreiben" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Messages: Nur Sender und Empfänger
CREATE POLICY "Nur Beteiligte sehen Nachrichten" ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Eingeloggte können Nachrichten senden" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Empfänger kann als gelesen markieren" ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);
