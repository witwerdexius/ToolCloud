-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Urlaubsmodus
-- Im Supabase SQL Editor ausführen (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS vacation_start DATE,
  ADD COLUMN IF NOT EXISTS vacation_end   DATE;

-- Sicherstellen, dass end >= start wenn beide gesetzt sind
ALTER TABLE users
  ADD CONSTRAINT IF NOT EXISTS valid_vacation_range
    CHECK (
      vacation_start IS NULL
      OR vacation_end IS NULL
      OR vacation_end >= vacation_start
    );
