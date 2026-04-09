# Supabase Edge Functions – Deployment

## Voraussetzungen

```bash
# Supabase CLI installieren (falls noch nicht vorhanden)
brew install supabase/tap/supabase

# Mit deinem Supabase-Account einloggen
supabase login

# Projekt verknüpfen (project-ref steht in der Dashboard-URL)
supabase link --project-ref <dein-project-ref>
```

---

## 1. Secrets setzen

Secrets sind Umgebungsvariablen, die in der Edge Function über `Deno.env.get()` gelesen werden.

```bash
# Resend API-Key (https://resend.com/api-keys → "Create API Key")
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Absender-Adresse (Domain muss in Resend verifiziert sein)
# Für lokale Tests: onboarding@resend.dev verwenden (kein DNS nötig)
supabase secrets set FROM_EMAIL="ToolCloud <noreply@toolcloud.de>"

# App-URL (für Links in den E-Mails)
supabase secrets set APP_URL=https://toolcloud.de
```

> **Tipp:** `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` werden von Supabase
> automatisch in jede Edge Function injiziert – diese musst du **nicht** manuell setzen.

Secrets anzeigen:
```bash
supabase secrets list
```

---

## 2. Edge Functions deployen

```bash
# Beide Funktionen deployen
supabase functions deploy notify-new-booking
supabase functions deploy notify-booking-status
```

Einzelne Funktion mit Logs prüfen:
```bash
supabase functions logs notify-new-booking --tail
supabase functions logs notify-booking-status --tail
```

---

## 3. `.env.local` in Next.js ergänzen

```bash
# Supabase Dashboard → Project Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
```

Ohne diesen Key werden Benachrichtigungen übersprungen (kein Hard-Fail).
Beim Start erscheint dann im Server-Log:

```
[notify] SUPABASE_SERVICE_ROLE_KEY nicht gesetzt – Edge Function übersprungen.
```

---

## 4. Resend – Absenderdomain verifizieren (Produktion)

1. Resend-Dashboard → **Domains** → **Add Domain**
2. DNS-Einträge (SPF, DKIM, DMARC) bei deinem DNS-Provider eintragen
3. Nach Verifizierung: `FROM_EMAIL` auf deine Domain setzen

Für **lokale Entwicklung / Tests** ohne eigene Domain:
```bash
supabase secrets set FROM_EMAIL="ToolCloud <onboarding@resend.dev>"
```
E-Mails können dann nur an die verifizierte Test-Adresse deines Resend-Accounts
gesendet werden.

---

## Wie die Benachrichtigungen ausgelöst werden

```
Nutzer sendet Buchungsanfrage
  └─▶ POST /api/bookings (Next.js)
        ├─▶ Buchung in DB anlegen
        └─▶ fetch → /functions/v1/notify-new-booking   (fire & forget)
              └─▶ Edge Function liest Buchungs-Daten aus DB
                  └─▶ Resend API → E-Mail an Vermieter

Vermieter nimmt an / lehnt ab
  └─▶ PATCH /api/bookings/[id] (Next.js)
        ├─▶ Status in DB aktualisieren
        └─▶ fetch → /functions/v1/notify-booking-status   (fire & forget)
              └─▶ Edge Function liest Buchungs-Daten aus DB
                  └─▶ Resend API → E-Mail an Mieter
```

Edge Functions werden mit dem `service_role`-JWT aufgerufen, das Supabase automatisch
verifiziert. Die Funktionen selbst verwenden den Service-Role-Client, um E-Mail-Adressen
aus `auth.users` abzurufen (RLS wird dabei umgangen – kein öffentlicher Zugriff).

---

## Lokale Entwicklung (optional)

```bash
# Edge Functions lokal starten
supabase start
supabase functions serve --env-file supabase/functions/.env.example

# Test-Aufruf (erfordert lokale Supabase-Instanz)
curl -i --location --request POST \
  'http://127.0.0.1:54321/functions/v1/notify-new-booking' \
  --header 'Authorization: Bearer <SUPABASE_ANON_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{"bookingId":"<uuid>"}'
```
