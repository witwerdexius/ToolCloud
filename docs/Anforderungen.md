# 📦 Anforderungsdokument – Verleihplattform für Gegenstände

## 1. Projektübersicht

### Ziel
Entwicklung einer Webplattform, auf der Nutzer Gegenstände verleihen und ausleihen können. Ziel ist es, Ressourcen zu teilen, Kosten zu sparen und Nachhaltigkeit zu fördern.

### Zielgruppe
- Privatpersonen
- Kleine Communities / Nachbarschaften
- Kreative / Freelancer (z. B. Technik, Musik-Equipment)

---

## 2. Kernfunktionen

### 2.1 Benutzerkonten
- Registrierung (E-Mail + Passwort)
- Login / Logout
- Passwort vergessen Funktion
- Profilverwaltung:
  - Name
  - Profilbild
  - Standort
  - Beschreibung
- Verifizierungsoption (optional)

---

### 2.2 Gegenstände verwalten
- Gegenstand einstellen:
  - Titel
  - Beschreibung
  - Kategorie
  - Bilder (Upload)
  - Verfügbarkeit (Kalender)
  - Preis (optional: kostenlos / pro Tag / pro Stunde)
  - Kaution (optional)
- Gegenstände bearbeiten / löschen
- Übersicht eigener Gegenstände

---

### 2.3 Suche & Filter
- Volltextsuche
- Filter:
  - Kategorie
  - Standort / Entfernung
  - Preis
  - Verfügbarkeit
- Sortierung:
  - Entfernung
  - Preis
  - Bewertung

---

### 2.4 Buchungssystem
- Anfrage senden
- Anfrage annehmen / ablehnen
- Buchungszeitraum auswählen
- Status:
  - Angefragt
  - Bestätigt
  - Abgeschlossen
  - Abgelehnt
- Kalenderintegration

---

### 2.5 Kommunikation
- Nachrichtenfunktion zwischen Nutzern
- Benachrichtigungen:
  - E-Mail
  - Optional: Push

---

### 2.6 Bewertungen & Vertrauen
- Bewertungssystem (1–5 Sterne)
- Kommentare
- Anzeige von:
  - Anzahl Verleihvorgänge
  - Durchschnittsbewertung

---

### 2.7 Zahlungsoptionen (optional)
- Integration eines Zahlungsanbieters (z. B. Stripe)
- Zahlung bei Buchung
- Kautionsverwaltung

---

## 3. Nicht-funktionale Anforderungen

### 3.1 Performance
- Ladezeit < 2 Sekunden
- Skalierbarkeit für viele Nutzer

### 3.2 Sicherheit
- HTTPS
- Passwort-Hashing
- Schutz vor:
  - SQL Injection
  - XSS
- DSGVO-Konformität

### 3.3 Usability
- Responsive Design (Mobile First)
- Intuitive Navigation
- Klare UI

---

## 4. Technische Anforderungen

### Frontend
- React / Vue / vergleichbares Framework
- Responsive UI

### Backend
- Node.js / Django / Flask
- REST API oder GraphQL

### Datenbank
- Supabase

### Hosting
- Cloud (Vercel)

---

## 5. Datenmodell (vereinfacht)

### User
- id
- name
- email
- password_hash
- location
- rating

### Item
- id
- owner_id
- title
- description
- category
- price
- deposit
- availability

### Booking
- id
- item_id
- borrower_id
- start_date
- end_date
- status

### Review
- id
- reviewer_id
- reviewed_user_id
- rating
- comment


---

## 7. MVP Definition

Für einen ersten Release (Minimum Viable Product):

- Registrierung & Login
- Gegenstände einstellen
- Suche
- Buchungsanfragen
- Messaging (einfach)
- Basis-Bewertungen


