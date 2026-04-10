-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: "Database error saving new user" beim Registrieren
--
-- Ursache: handle_new_user() läuft als SECURITY DEFINER aus dem auth-Kontext
-- ohne gesetzten search_path, daher findet "INSERT INTO users" die Tabelle
-- public.users nicht zuverlässig. Zusätzlich fehlen ggf. INSERT-Rechte für
-- den supabase_auth_admin.
--
-- Ausführen: Supabase Dashboard → SQL Editor → dieses Script einfügen → Run
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Neuer Nutzer')
  );
  RETURN NEW;
END;
$$;

GRANT INSERT ON public.users TO supabase_auth_admin;

-- Falls der Trigger aus irgendeinem Grund weg ist, neu anlegen:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
