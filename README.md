# Maskindeling

Intern plattform for deling av anleggsmaskiner på tvers av prosjekter og organisasjoner (Veidekke, kommunale etater m.fl.).

## Funksjoner

| Side | Beskrivelse |
|---|---|
| **Dashboard** `/` | Oversiktskort, tilgjengelige maskiner, forfalt vedlikehold, ventende forespørsler |
| **Utforsk** `/utforsk` | Søk og filtrer maskiner på tvers av org/type/status, klikk for å låne |
| **Prosjekter** `/prosjekter` | Kanban-tavle — dra maskiner mellom prosjektkolonner |
| **Maskiner** `/maskiner` | Komplett maskinliste, legg til/slett, klikk for detaljer |
| **Maskin** `/maskiner/[id]` | Maskindetaljer, tilgjengelighetskalender, send låneforespørsel, vedlikeholdslogg |
| **Utlån** `/utlaan` | Godkjenn/avvis innkommende forespørsler, marker returnert |
| **Organisasjoner** `/organisasjoner` | Administrer bedrifter og etater |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Neon** — serverless PostgreSQL
- **Drizzle ORM**
- **@dnd-kit/core** — drag & drop i Kanban

## Oppsett

### 1. Klon og installer

```bash
git clone <repo-url>
cd maskindelingno
npm install
```

### 2. Opprett Neon-database

Gå til [console.neon.tech](https://console.neon.tech), opprett et prosjekt og kopier tilkoblingsstrengen.

### 3. Miljøvariabler

```bash
cp .env.example .env.local
# Lim inn DATABASE_URL i .env.local
```

### 4. Opprett tabeller

```bash
npx drizzle-kit push
```

Eller bruk Neon SQL Editor og lim inn innholdet fra [`schema.sql`](./schema.sql).

### 5. Last inn demo-data

```bash
npm run db:seed
```

Oppretter 4 organisasjoner, 2 prosjekter, 6 maskiner, 2 låneforespørsler og 2 bookinger.

### 6. Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

---

## Deploy til Vercel

1. Push til GitHub
2. Importer prosjektet på [vercel.com](https://vercel.com)
3. Legg til `DATABASE_URL` under **Settings → Environment Variables**
4. Deploy

**Etter første deploy** — initialiser DB med ett kall (alternativ til trinn 4–5 over):

```bash
curl -X POST https://din-app.vercel.app/api/setup
```

Dette oppretter tabeller og laster inn demo-data automatisk.

---

## Filstruktur

```
app/
  page.tsx                          # Dashboard
  utforsk/page.tsx                  # Søk + bla gjennom maskiner
  prosjekter/page.tsx               # Kanban (dnd-kit)
  maskiner/
    page.tsx                        # Maskinliste
    [id]/page.tsx                   # Maskindetaljer + kalender + låneform
  utlaan/page.tsx                   # Låneforespørsler
  organisasjoner/page.tsx           # Organisasjoner
  api/
    dashboard/route.ts
    machines/route.ts
    machines/[id]/route.ts
    machines/[id]/availability/route.ts
    projects/route.ts
    projects/[id]/route.ts
    organizations/route.ts
    organizations/[id]/route.ts
    loan-requests/route.ts
    loan-requests/[id]/route.ts
    maintenance/route.ts
    bookings/route.ts
    setup/route.ts                  # POST — opprett tabeller + seed

lib/
  db.ts                             # Drizzle/Neon lazy connection
  schema.ts                         # Alle tabelldefinisjoner + typer

components/
  Sidebar.tsx
  StatusBadge.tsx
  MachineCard.tsx
  AvailabilityCalendar.tsx

scripts/
  seed.ts                           # Seed-script (npm run db:seed)

schema.sql                          # SQL for Neon SQL Editor
```
