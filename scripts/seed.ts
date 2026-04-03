import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log("Seeding database…");

  // Clear existing data (in FK-safe order)
  await sql`DELETE FROM bookings`;
  await sql`DELETE FROM loan_requests`;
  await sql`DELETE FROM maintenance_logs`;
  await sql`DELETE FROM machines`;
  await sql`DELETE FROM projects`;
  await sql`DELETE FROM organizations`;

  // Organizations
  const [veidekke] = await sql`
    INSERT INTO organizations (name, type) VALUES ('Veidekke AS', 'bedrift') RETURNING id
  `;
  const [voa] = await sql`
    INSERT INTO organizations (name, type) VALUES ('Vann- og avløpsetaten', 'etat') RETURNING id
  `;
  const [pog] = await sql`
    INSERT INTO organizations (name, type) VALUES ('Park og gravlund', 'etat') RETURNING id
  `;
  const [vot] = await sql`
    INSERT INTO organizations (name, type) VALUES ('Vei og trafikk', 'etat') RETURNING id
  `;
  console.log("  → 4 organisasjoner");

  // Projects
  const [e18] = await sql`
    INSERT INTO projects (name, organization_id, location, start_date, end_date)
    VALUES ('E18 Vestkorridoren', ${veidekke.id}, 'Oslo', '2025-01-01', '2027-12-31')
    RETURNING id
  `;
  const [sentrum] = await sql`
    INSERT INTO projects (name, organization_id, location, start_date, end_date)
    VALUES ('Sentrum rehabilitering', ${voa.id}, 'Oslo Sentrum', '2025-06-01', '2026-12-31')
    RETURNING id
  `;
  console.log("  → 2 prosjekter");

  // Machines
  const [volvo] = await sql`
    INSERT INTO machines (make, model, serial_number, type, status,
      owner_organization_id, project_id,
      responsible_name, responsible_phone, responsible_email)
    VALUES ('Volvo', 'EC220E', 'VCE220E001', 'gravemaskine', 'available',
      ${veidekke.id}, ${e18.id},
      'Lars Eriksen', '+47 911 11 111', 'lars@veidekke.no')
    RETURNING id
  `;
  const [wacker] = await sql`
    INSERT INTO machines (make, model, serial_number, type, status,
      owner_organization_id, project_id,
      responsible_name, responsible_phone, responsible_email)
    VALUES ('Wacker Neuson', 'ET16', 'WN-ET16-002', 'minigraver', 'available',
      ${voa.id}, NULL,
      'Kari Nilsen', '+47 922 22 222', 'kari@voa.oslo.no')
    RETURNING id
  `;
  const [genie] = await sql`
    INSERT INTO machines (make, model, serial_number, type, status,
      owner_organization_id, project_id,
      responsible_name, responsible_phone, responsible_email)
    VALUES ('Genie', 'Z-45', 'GEN-Z45-003', 'lift', 'booked',
      ${veidekke.id}, ${e18.id},
      'Per Hansen', '+47 933 33 333', 'per@veidekke.no')
    RETURNING id
  `;
  const [atlas] = await sql`
    INSERT INTO machines (make, model, serial_number, type, status,
      owner_organization_id, project_id,
      responsible_name, responsible_phone, responsible_email)
    VALUES ('Atlas Copco', 'XAS 375', 'AC-XAS375-004', 'kompressor', 'available',
      ${vot.id}, NULL,
      'Ole Berg', '+47 944 44 444', 'ole@vot.oslo.no')
    RETURNING id
  `;
  await sql`
    INSERT INTO machines (make, model, serial_number, type, status,
      owner_organization_id, project_id,
      responsible_name, responsible_phone, responsible_email)
    VALUES ('Caterpillar', '950M', 'CAT-950M-005', 'hjullaster', 'under_maintenance',
      ${veidekke.id}, NULL,
      'Anne Dahl', '+47 955 55 555', 'anne@veidekke.no')
  `;
  await sql`
    INSERT INTO machines (make, model, serial_number, type, status,
      owner_organization_id, project_id,
      responsible_name, responsible_phone, responsible_email)
    VALUES ('Manitou', '150ATJ', 'MAN-150ATJ-006', 'lift', 'available',
      ${pog.id}, NULL,
      'Ingrid Lund', '+47 966 66 666', 'ingrid@pog.oslo.no')
  `;
  console.log("  → 6 maskiner");

  // Maintenance logs (one overdue)
  const overdueDate = new Date();
  overdueDate.setMonth(overdueDate.getMonth() - 2);
  const overdueStr = overdueDate.toISOString().split("T")[0];

  await sql`
    INSERT INTO maintenance_logs (machine_id, title, description, performed_by, date, next_due_date)
    VALUES (${volvo.id}, '500-timers service', 'Motorolje, filtre og hydraulikk kontrollert. Alt OK.',
      'Lars Eriksen', '2026-01-15', ${overdueStr})
  `;
  await sql`
    INSERT INTO maintenance_logs (machine_id, title, description, performed_by, date, next_due_date)
    VALUES (${genie.id}, 'Sikkerhetssjekk lift', 'Årlig sertifisering og sikkerhetsgjennomgang utført.',
      'Per Hansen', '2026-02-01', '2027-02-01')
  `;
  console.log("  → 2 vedlikeholdslogger");

  // Loan requests
  const [lr1] = await sql`
    INSERT INTO loan_requests (machine_id, requester_organization_id,
      requester_name, requester_phone, requester_email,
      from_date, to_date, purpose, status)
    VALUES (${wacker.id}, ${pog.id},
      'Ingrid Lund', '+47 966 66 666', 'ingrid@pog.oslo.no',
      '2026-04-10', '2026-04-20', 'Gravearbeid i Botanisk hage', 'pending')
    RETURNING id
  `;
  const [lr2] = await sql`
    INSERT INTO loan_requests (machine_id, requester_organization_id,
      requester_name, requester_phone, requester_email,
      from_date, to_date, purpose, status, response_message)
    VALUES (${atlas.id}, ${veidekke.id},
      'Lars Eriksen', '+47 911 11 111', 'lars@veidekke.no',
      '2026-04-05', '2026-04-15', 'Kompressorarbeid E18', 'approved',
      'Godkjent. Ta kontakt med Ole Berg for nøkkeloverlevering.')
    RETURNING id
  `;
  console.log("  → 2 låneforespørsler");

  // Bookings
  await sql`
    INSERT INTO bookings (machine_id, loan_request_id, from_date, to_date, borrower_organization_id)
    VALUES (${atlas.id}, ${lr2.id}, '2026-04-05', '2026-04-15', ${veidekke.id})
  `;
  await sql`
    INSERT INTO bookings (machine_id, loan_request_id, from_date, to_date, borrower_organization_id)
    VALUES (${genie.id}, NULL, '2026-04-01', '2026-04-30', ${voa.id})
  `;
  console.log("  → 2 bestillinger");

  console.log("\nSeeding fullført!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
