import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'bedrift',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        location TEXT,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS machines (
        id SERIAL PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        serial_number TEXT,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        owner_organization_id INTEGER NOT NULL REFERENCES organizations(id),
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        responsible_name TEXT,
        responsible_phone TEXT,
        responsible_email TEXT,
        notes TEXT,
        image_url TEXT,
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

    await sql`
      CREATE TABLE IF NOT EXISTS loan_requests (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER NOT NULL REFERENCES machines(id),
        requester_organization_id INTEGER NOT NULL REFERENCES organizations(id),
        requester_name TEXT NOT NULL,
        requester_phone TEXT,
        requester_email TEXT,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        purpose TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        response_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER NOT NULL REFERENCES machines(id),
        loan_request_id INTEGER REFERENCES loan_requests(id),
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        borrower_organization_id INTEGER NOT NULL REFERENCES organizations(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Check if already seeded
    const existing = await sql`SELECT COUNT(*) AS count FROM organizations`;
    if (parseInt(existing[0].count) > 0) {
      return NextResponse.json({ message: "already seeded" });
    }

    // 3. Seed organizations
    const [veidekke] = await sql`
      INSERT INTO organizations (name, type) VALUES ('Veidekke AS', 'bedrift') RETURNING id
    `;
    const [vannOgAvlop] = await sql`
      INSERT INTO organizations (name, type) VALUES ('Vann- og avløpsetaten', 'etat') RETURNING id
    `;
    const [parkOgGravlund] = await sql`
      INSERT INTO organizations (name, type) VALUES ('Park og gravlund', 'etat') RETURNING id
    `;
    const [veiOgTrafikk] = await sql`
      INSERT INTO organizations (name, type) VALUES ('Vei og trafikk', 'etat') RETURNING id
    `;

    // 4. Seed projects
    const [e18Project] = await sql`
      INSERT INTO projects (name, organization_id, location, start_date, end_date)
      VALUES ('E18 Vestkorridoren', ${veidekke.id}, 'Oslo', '2025-01-01', '2027-12-31')
      RETURNING id
    `;
    const [sentrumProject] = await sql`
      INSERT INTO projects (name, organization_id, location, start_date, end_date)
      VALUES ('Sentrum rehabilitering', ${vannOgAvlop.id}, 'Oslo Sentrum', '2025-06-01', '2026-12-31')
      RETURNING id
    `;

    // 5. Seed machines
    const [volvo] = await sql`
      INSERT INTO machines (make, model, serial_number, type, status, owner_organization_id, project_id, responsible_name, responsible_phone, responsible_email)
      VALUES ('Volvo', 'EC220E', 'VCE220E001', 'gravemaskine', 'available', ${veidekke.id}, ${e18Project.id}, 'Lars Eriksen', '+47 911 11 111', 'lars@veidekke.no')
      RETURNING id
    `;
    const [wacker] = await sql`
      INSERT INTO machines (make, model, serial_number, type, status, owner_organization_id, project_id, responsible_name, responsible_phone, responsible_email)
      VALUES ('Wacker Neuson', 'ET16', 'WN-ET16-002', 'minigraver', 'available', ${vannOgAvlop.id}, NULL, 'Kari Nilsen', '+47 922 22 222', 'kari@voa.oslo.no')
      RETURNING id
    `;
    const [genie] = await sql`
      INSERT INTO machines (make, model, serial_number, type, status, owner_organization_id, project_id, responsible_name, responsible_phone, responsible_email)
      VALUES ('Genie', 'Z-45', 'GEN-Z45-003', 'lift', 'booked', ${veidekke.id}, ${e18Project.id}, 'Per Hansen', '+47 933 33 333', 'per@veidekke.no')
      RETURNING id
    `;
    const [atlasCopco] = await sql`
      INSERT INTO machines (make, model, serial_number, type, status, owner_organization_id, project_id, responsible_name, responsible_phone, responsible_email)
      VALUES ('Atlas Copco', 'XAS 375', 'AC-XAS375-004', 'kompressor', 'available', ${veiOgTrafikk.id}, NULL, 'Ole Berg', '+47 944 44 444', 'ole@vot.oslo.no')
      RETURNING id
    `;
    await sql`
      INSERT INTO machines (make, model, serial_number, type, status, owner_organization_id, project_id, responsible_name, responsible_phone, responsible_email)
      VALUES ('Caterpillar', '950M', 'CAT-950M-005', 'hjullaster', 'under_maintenance', ${veidekke.id}, NULL, 'Anne Dahl', '+47 955 55 555', 'anne@veidekke.no')
    `;
    await sql`
      INSERT INTO machines (make, model, serial_number, type, status, owner_organization_id, project_id, responsible_name, responsible_phone, responsible_email)
      VALUES ('Manitou', '150ATJ', 'MAN-150ATJ-006', 'lift', 'available', ${parkOgGravlund.id}, NULL, 'Ingrid Lund', '+47 966 66 666', 'ingrid@pog.oslo.no')
    `;

    // 6. Seed loan requests
    const [loanRequest1] = await sql`
      INSERT INTO loan_requests (machine_id, requester_organization_id, requester_name, requester_phone, requester_email, from_date, to_date, purpose, status)
      VALUES (${wacker.id}, ${parkOgGravlund.id}, 'Ingrid Lund', '+47 966 66 666', 'ingrid@pog.oslo.no', '2026-04-10', '2026-04-20', 'Gravearbeid i parken', 'pending')
      RETURNING id
    `;
    const [loanRequest2] = await sql`
      INSERT INTO loan_requests (machine_id, requester_organization_id, requester_name, requester_phone, requester_email, from_date, to_date, purpose, status)
      VALUES (${atlasCopco.id}, ${veidekke.id}, 'Lars Eriksen', '+47 911 11 111', 'lars@veidekke.no', '2026-04-05', '2026-04-15', 'Kompressorarbeid E18', 'approved')
      RETURNING id
    `;

    // 7. Seed booking for approved loan request (Atlas Copco)
    await sql`
      INSERT INTO bookings (machine_id, loan_request_id, from_date, to_date, borrower_organization_id)
      VALUES (${atlasCopco.id}, ${loanRequest2.id}, '2026-04-05', '2026-04-15', ${veidekke.id})
    `;

    // 8. Seed booking for Genie Z-45 (booked by Vann- og avløpsetaten)
    await sql`
      INSERT INTO bookings (machine_id, loan_request_id, from_date, to_date, borrower_organization_id)
      VALUES (${genie.id}, NULL, '2026-04-01', '2026-04-30', ${vannOgAvlop.id})
    `;

    return NextResponse.json({
      message: "Setup complete! Tables created and demo data seeded.",
      organizations: 4,
      projects: 2,
      machines: 6,
      loan_requests: 2,
      bookings: 2,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
