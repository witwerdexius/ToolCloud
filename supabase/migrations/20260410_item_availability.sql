-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: item_availability-Tabelle für Verfügbarkeitskalender
-- Vermieter können Zeiträume als "nicht verfügbar" markieren
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE item_availability (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX item_availability_item_idx ON item_availability(item_id);

ALTER TABLE item_availability ENABLE ROW LEVEL SECURITY;

-- Jeder kann Verfügbarkeiten lesen (nötig für Buchungsformular)
CREATE POLICY "Verfügbarkeiten sind öffentlich lesbar"
  ON item_availability FOR SELECT USING (TRUE);

-- Nur der Eigentümer des Inserats kann Verfügbarkeiten verwalten
CREATE POLICY "Eigentümer kann Verfügbarkeiten verwalten"
  ON item_availability FOR ALL
  USING (
    auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id)
  )
  WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id)
  );
