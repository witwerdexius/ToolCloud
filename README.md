# ToolCloud

> **Leihen statt kaufen. Gemeinsam mehr.**  
> Webplattform für den Verleih von Gegenständen zwischen Privatpersonen.

---

## Tech-Stack

| Schicht     | Technologie                          | Begründung                                   |
|-------------|--------------------------------------|----------------------------------------------|
| Framework   | Next.js 14 (App Router)              | SSR für SEO, API-Routes, Vercel-nativ        |
| Sprache     | TypeScript                           | Typsicherheit, bessere DX                    |
| Styling     | Tailwind CSS                         | Utility-first, Mobile First                  |
| Datenbank   | Supabase (PostgreSQL)                | Auth, Realtime, Storage inklusive            |
| Hosting     | Vercel                               | Zero-Config, Preview-Deployments pro Branch  |

---

## Projektstruktur

```
toolcloud/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Startseite / Suche
│   │   ├── items/[id]/page.tsx     # Gegenstand-Detailseite
│   │   ├── profile/page.tsx        # Profil & Dashboard
│   │   ├── auth/                   # Login / Register
│   │   └── api/                    # Route Handlers (REST API)
│   │       ├── items/route.ts
│   │       ├── bookings/route.ts
│   │       ├── users/route.ts
│   │       └── reviews/route.ts
│   ├── components/
│   │   ├── ui/                     # Shared: Button, Badge, Input …
│   │   ├── layout/                 # Navbar, Footer
│   │   ├── items/                  # ItemCard, ItemGrid, ItemGallery …
│   │   ├── bookings/               # BookingBox, BookingList …
│   │   └── search/                 # SearchBar, FilterBar, CategoryChips
│   ├── lib/
│   │   ├── supabase.ts             # Supabase Client (Browser + Server)
│   │   └── utils.ts                # Hilfsfunktionen
│   ├── types/
│   │   └── index.ts                # Alle TypeScript-Typen
│   └── hooks/                      # Custom React Hooks
├── supabase/
│   ├── schema.sql                  # Datenbankschema
│   └── migrations/                 # Migrations-History
├── public/
├── .env.example                    # Pflichtfelder für .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Lokale Einrichtung

### Voraussetzungen

- Node.js ≥ 18.17
- npm ≥ 9
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, für lokale DB)

### Setup

```bash
# 1. Repo klonen
git clone <repo-url>
cd toolcloud

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungsvariablen anlegen
cp .env.example .env.local
# → .env.local mit echten Supabase-Werten befüllen

# 4. Datenbankschema in Supabase anlegen
# → supabase/schema.sql im Supabase-Dashboard (SQL Editor) ausführen

# 5. Entwicklungsserver starten
npm run dev
# → http://localhost:3000
```

---

## Branching-Strategie

```
main          ←  Production (nur via PR, CI muss grün sein)
  └── dev     ←  Integration Branch (alle Features landen hier zuerst)
        ├── feature/auth-login
        ├── feature/item-listing
        ├── feature/booking-system
        └── fix/…
```

**Workflow:**
1. Branch von `dev` erstellen: `git checkout -b feature/mein-feature`
2. Commits mit sprechenden Nachrichten: `feat: Suchfilter nach Kategorie`
3. Pull Request nach `dev` → Code Review
4. Nach Sprint-Abschluss: `dev` → `main` (Release)

### Commit-Konvention

```
feat:  Neue Funktion
fix:   Bugfix
chore: Konfiguration, Abhängigkeiten
docs:  Dokumentation
style: CSS/Styling (kein Logik-Change)
refactor: Umstrukturierung ohne Verhaltensänderung
```

---

## Deployment

Das Projekt ist auf [Vercel](https://vercel.com) konfiguriert.

- **`main`** → Production (`toolcloud.vercel.app`)
- **`dev`** → Staging-Preview (automatisch)
- **Feature-Branches** → Preview-URLs (automatisch)

Umgebungsvariablen im Vercel Dashboard unter *Project → Settings → Environment Variables* eintragen.

---

## Weiterführend

- [ROADMAP.md](./ROADMAP.md) – Phasen & Meilensteine
- [supabase/schema.sql](./supabase/schema.sql) – Datenbankschema
- [Anforderungsdokument](./docs/Anforderungen.md)
