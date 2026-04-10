# ToolCloud – Entwicklungs-Roadmap

## Überblick

| Phase | Inhalt                              | Ziel-Zeitraum | Status     |
|-------|-------------------------------------|---------------|------------|
| 0     | Setup & Infrastruktur               | Woche 1       | ✅ Erledigt |
| 1     | MVP – Kernfunktionen                | Woche 2–5     | 🔲 Offen   |
| 2     | Qualität & Vertrauen                | Woche 6–8     | 🔲 Offen   |
| 3     | Zahlung & Monetarisierung           | Woche 9–11    | 🔲 Offen   |
| 4     | Wachstum & Optimierung              | Ab Woche 12   | 🔲 Offen   |

---

## Phase 0 – Setup & Infrastruktur ✅

**Ziel:** Entwicklungsumgebung und Projektstruktur stehen.

- [x] Git-Repository initialisiert (`main` + `dev` Branch)
- [x] Next.js 14 Projektstruktur angelegt (App Router, TypeScript)
- [x] Tailwind CSS konfiguriert
- [x] TypeScript-Typen definiert (`User`, `Item`, `Booking`, `Review`)
- [x] Supabase Client eingerichtet (Browser + Server)
- [x] `.env.example` mit allen Pflichtfeldern
- [x] README mit Setup-Anleitung
- [ ] Supabase-Projekt anlegen (Dashboard)
- [ ] Vercel-Projekt anlegen & mit Git verbinden
- [ ] `schema.sql` im Supabase SQL Editor ausführen

---

## Phase 1 – MVP (Minimum Viable Product)

**Ziel:** Alle Kernfunktionen des MVP lauffähig. Nutzer können sich registrieren, Gegenstände einstellen, suchen und Buchungsanfragen senden.

### Auth & Nutzerkonten

- [ ] Registrierung (E-Mail + Passwort via Supabase Auth)
- [ ] Login / Logout
- [ ] „Passwort vergessen"-Flow
- [ ] Profil anlegen (Name, Standort, Beschreibung)
- [ ] Auth-Middleware (geschützte Routen)

### Inserate

- [ ] Gegenstand einstellen (Formular mit Validierung via Zod)
- [ ] Bilder hochladen (Supabase Storage)
- [x] Verfügbarkeits-Kalender setzen
- [ ] Preis & Kaution konfigurieren
- [ ] Inserat bearbeiten / deaktivieren

### Suche & Entdecken

- [ ] Volltextsuche gegen Supabase
- [ ] Filter: Kategorie, Preis, Standort/Umkreis
- [ ] Ergebnis-Grid mit Karten
- [ ] Gegenstand-Detailseite

### Buchungssystem

- [ ] Buchungsanfrage senden (Datum + Nachricht)
- [ ] Anfragen annehmen / ablehnen (Vermieter-Dashboard)
- [ ] Status-Anzeige: Angefragt → Bestätigt → Abgeschlossen
- [ ] Eigene Buchungen im Profil-Dashboard

### Messaging (einfach)

- [ ] Nachricht senden (im Kontext einer Buchung)
- [ ] Postfach im Profil-Dashboard

### Benachrichtigungen

- [ ] E-Mail bei neuer Buchungsanfrage (Supabase Edge Functions / Resend)
- [ ] E-Mail bei Status-Änderung

---

## Phase 2 – Qualität & Vertrauen

**Ziel:** Nutzer können sich gegenseitig bewerten; Plattform wirkt vertrauenswürdig.

- [ ] Bewertungssystem (1–5 Sterne + Kommentar)
- [ ] Bewertungen nur nach abgeschlossener Buchung möglich
- [ ] Ø-Bewertung + Anzahl auf Profil & Inseraten anzeigen
- [ ] Profilbild-Upload
- [ ] E-Mail-Verifizierung
- [ ] Kautions-Flow (manuell quittieren)
- [ ] Suchfilter: Verfügbarkeit (Datumspicker)
- [ ] Sortierung nach Entfernung (Geolocation)
- [ ] SEO: Dynamische Meta-Tags für Inserate (Next.js Metadata API)
- [ ] Responsive-Feinschliff / Mobile-Optimierung

---

## Phase 3 – Zahlung & Monetarisierung

**Ziel:** Optionale Bezahlung über die Plattform; Einnahmequellen.

- [ ] Stripe-Integration (Payment Intent)
- [ ] Zahlungsabwicklung bei Buchungsbestätigung
- [ ] Kautionsverwaltung (Hold + Release)
- [ ] Auszahlung an Vermieter (Stripe Connect)
- [ ] Servicegebühr-Logik serverseitig
- [ ] Rechnungs-E-Mail / Zahlungshistorie

---

## Phase 4 – Wachstum & Optimierung

**Ziel:** Plattform skaliert und gewinnt Nutzer.

- [ ] Push-Benachrichtigungen (Web Push / PWA)
- [ ] Kartenansicht (Mapbox / Google Maps)
- [ ] Favoriten / Merkliste
- [ ] Empfehlungsalgorithmus (ähnliche Inserate)
- [ ] Analytics-Dashboard (Vercel Analytics / PostHog)
- [ ] Performance-Audit (Core Web Vitals)
- [ ] Moderations-Tools (gemeldete Inserate)
- [ ] Admin-Panel

---

## Technische Schulden / laufende Aufgaben

Diese Tasks begleiten alle Phasen:

- [ ] Unit-Tests für Utility-Funktionen (Vitest)
- [ ] E2E-Tests für kritische User Flows (Playwright)
- [ ] Fehler-Monitoring (Sentry)
- [ ] Linting & Formatting (ESLint + Prettier) im CI
- [ ] Abhängigkeiten regelmäßig aktualisieren (Renovate / Dependabot)
- [ ] DSGVO: Datenschutzerklärung, Cookie-Banner, Recht auf Löschung

---

## Meilensteine

```
April 2026    Phase 0 abgeschlossen  →  Repo + Infra steht
Mai 2026      Phase 1 abgeschlossen  →  MVP live (geschlossener Beta-Test)
Juni 2026     Phase 2 abgeschlossen  →  Öffentlicher Launch
Q3 2026       Phase 3 abgeschlossen  →  Bezahlfunktion live
Q4 2026       Phase 4               →  Skalierung & Wachstum
```
