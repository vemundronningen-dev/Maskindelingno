import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// POST /api/setup — creates tables and seeds demo data.
// Hit this endpoint ONCE after first deploy, then delete or protect it.
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS machines (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        make TEXT,
        model TEXT,
        year INTEGER,
        serial_number TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        location TEXT,
        notes TEXT,
        responsible_name TEXT,
        responsible_phone TEXT,
        responsible_email TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        performed_by TEXT,
        date DATE NOT NULL,
        next_due_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Seed machines (skip if already seeded)
    const existing = await sql`SELECT COUNT(*) as count FROM machines`;
    if (parseInt(existing[0].count) > 0) {
      return NextResponse.json({ message: "Already seeded — skipped.", tables: "ok" });
    }

    const inserted = await sql`
      INSERT INTO machines
        (name, type, make, model, year, serial_number, status, location, notes,
         responsible_name, responsible_phone, responsible_email)
      VALUES
        ('Volvo EC300E', 'Gravemaskin', 'Volvo', 'EC300E', 2020, 'VCE0300EL00123456',
         'active', 'Prosjekt Hammerveien, Oslo', 'Nylig service utført. Fungerer godt.',
         'Lars Erik Dahl', '+47 91 23 45 67', 'lars.dahl@anlegg.no'),
        ('Caterpillar 320', 'Gravemaskin', 'Caterpillar', '320', 2018, 'CAT0320GC00789012',
         'under_maintenance', 'Verksted, Bergen', 'Hydraulikklekkasje. Venter på reservedeler.',
         'Marte Skogen', '+47 98 76 54 32', 'marte.skogen@anlegg.no'),
        ('Komatsu WA380', 'Hjullaster', 'Komatsu', 'WA380-8', 2021, 'KOM0380WA00345678',
         'active', 'Prosjekt Fjordvegen, Stavanger', 'God stand. Service planlagt neste kvartal.',
         'Tor Haugen', '+47 45 67 89 01', 'tor.haugen@anlegg.no')
      RETURNING id
    `;

    // 3. Seed maintenance logs (one overdue, one upcoming)
    const today = new Date();
    const overdue = new Date(today);
    overdue.setMonth(overdue.getMonth() - 2);
    const upcoming = new Date(today);
    upcoming.setMonth(upcoming.getMonth() + 3);

    await sql`
      INSERT INTO maintenance_logs
        (machine_id, title, description, performed_by, date, next_due_date)
      VALUES
        (${inserted[0].id},
         '500t-service',
         'Byttet motorolje, oljefilter og luftfilter. Kontrollert hydraulikksystem. Alt OK.',
         'Lars Erik Dahl',
         '2026-01-15',
         ${overdue.toISOString().split("T")[0]}),
        (${inserted[1].id},
         'Hydraulikkreparasjon',
         'Identifisert lekkasje i hovedsylinder. Venter på reservedeler fra Caterpillar.',
         'Marte Skogen',
         '2026-03-20',
         ${upcoming.toISOString().split("T")[0]})
    `;

    return NextResponse.json({
      message: "Setup complete! Tables created and demo data seeded.",
      machines: inserted.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
