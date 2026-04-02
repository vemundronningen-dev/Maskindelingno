# Maskindeling

Administrasjonsverktøy for anleggsmaskiner. Bygget med Next.js 14, TypeScript, Tailwind CSS, Neon (PostgreSQL) og Drizzle ORM.

## Deploy til Vercel (anbefalt)

### 1. Push til GitHub og importer til Vercel

1. Push koden til GitHub
2. Gå til [vercel.com](https://vercel.com) → **New Project** → importer repoet
3. Under **Environment Variables**, legg til:
   ```
   DATABASE_URL=postgresql://neondb_owner:...@....neon.tech/neondb?sslmode=require
   ```
4. Klikk **Deploy**

### 2. Opprett databasetabeller

**Alternativ A — Neon SQL Editor (enklest)**

1. Gå til [console.neon.tech](https://console.neon.tech)
2. Velg prosjekt → **SQL Editor**
3. Lim inn og kjør innholdet fra [`schema.sql`](./schema.sql)

**Alternativ B — API-endepunkt (etter deploy)**

Etter at appen er deployet, kall setup-endepunktet én gang:

```bash
curl -X POST https://din-app.vercel.app/api/setup
```

Dette oppretter tabeller **og** laster inn demo-data (3 maskiner, 2 vedlikeholdslogger).

---

## Lokal utvikling

```bash
git clone <repo-url>
cd maskindelingno
npm install
cp .env.example .env.local   # legg inn DATABASE_URL
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

Opprett tabeller via Neon SQL Editor eller kjør:

```bash
curl -X POST http://localhost:3000/api/setup
```

---

## Struktur

```
app/
  page.tsx                    # Dashboard
  maskiner/
    page.tsx                  # Maskinliste
    [id]/page.tsx             # Maskindetaljer
  api/
    machines/route.ts         # GET alle, POST ny
    machines/[id]/route.ts    # GET én, DELETE
    maintenance/route.ts      # POST vedlikeholdslogg
    setup/route.ts            # POST — opprett tabeller + seed
lib/
  db.ts                       # Drizzle/Neon-tilkobling
  schema.ts                   # Tabelldefinisjoner
  seed.ts                     # Seed-script (krever lokal terminal)
components/
  Sidebar.tsx
  StatusBadge.tsx
schema.sql                    # SQL for Neon SQL Editor
```

## Tech Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS**
- **Neon** – serverless PostgreSQL
- **Drizzle ORM**
