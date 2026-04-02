# Maskindeling

Administrasjonsverktøy for anleggsmaskiner. Bygget med Next.js 14, TypeScript, Tailwind CSS, Neon (PostgreSQL) og Drizzle ORM.

## Oppsett

### 1. Klon og installer

```bash
git clone <repo-url>
cd maskindelingno
npm install
```

### 2. Miljøvariabler

Kopier `.env.example` til `.env.local` og legg inn din Neon-tilkoblingsstreng:

```bash
cp .env.example .env.local
```

Rediger `.env.local`:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

Neon-tilkoblingsstrengen finner du under **Connection Details** i Neon-dashboardet.

### 3. Opprett databasetabeller

```bash
npx drizzle-kit push
```

### 4. Last inn testdata (valgfritt)

```bash
npm run db:seed
```

Dette oppretter 3 maskiner og 2 vedlikeholdslogger med realistiske norske data.

### 5. Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Deploy til Vercel

1. Push til GitHub
2. Importer prosjektet på [vercel.com](https://vercel.com)
3. Legg til miljøvariabelen `DATABASE_URL` under **Settings → Environment Variables**
4. Deploy

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
lib/
  db.ts                       # Drizzle/Neon-tilkobling
  schema.ts                   # Tabelldefinisjoner
  seed.ts                     # Testdata
components/
  Sidebar.tsx
  StatusBadge.tsx
```

## Tech Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS**
- **Neon** – serverless PostgreSQL
- **Drizzle ORM**
