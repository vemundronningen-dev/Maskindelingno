import { db } from "./db";
import { machines, maintenance_logs } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(maintenance_logs);
  await db.delete(machines);

  // Insert machines
  const inserted = await db
    .insert(machines)
    .values([
      {
        name: "Volvo EC300E",
        type: "Gravemaskin",
        make: "Volvo",
        model: "EC300E",
        year: 2020,
        serial_number: "VCE0300EL00123456",
        status: "active",
        location: "Prosjekt Hammerveien, Oslo",
        notes: "Nylig service utført. Fungerer godt.",
        responsible_name: "Lars Erik Dahl",
        responsible_phone: "+47 91 23 45 67",
        responsible_email: "lars.dahl@anlegg.no",
      },
      {
        name: "Caterpillar 320",
        type: "Gravemaskin",
        make: "Caterpillar",
        model: "320",
        year: 2018,
        serial_number: "CAT0320GC00789012",
        status: "under_maintenance",
        location: "Verksted, Bergen",
        notes: "Hydraulikklekkasje. Venter på reservedeler.",
        responsible_name: "Marte Skogen",
        responsible_phone: "+47 98 76 54 32",
        responsible_email: "marte.skogen@anlegg.no",
      },
      {
        name: "Komatsu WA380",
        type: "Hjullaster",
        make: "Komatsu",
        model: "WA380-8",
        year: 2021,
        serial_number: "KOM0380WA00345678",
        status: "active",
        location: "Prosjekt Fjordvegen, Stavanger",
        notes: "God stand. Service planlagt neste kvartal.",
        responsible_name: "Tor Haugen",
        responsible_phone: "+47 45 67 89 01",
        responsible_email: "tor.haugen@anlegg.no",
      },
    ])
    .returning();

  console.log(`Inserted ${inserted.length} machines`);

  // Insert maintenance logs
  const today = new Date();
  const overdueDate = new Date(today);
  overdueDate.setMonth(overdueDate.getMonth() - 2); // 2 months ago (overdue)

  const upcomingDate = new Date(today);
  upcomingDate.setMonth(upcomingDate.getMonth() + 3); // 3 months from now

  const logs = await db
    .insert(maintenance_logs)
    .values([
      {
        machine_id: inserted[0].id,
        title: "Periodisk 500t-service",
        description:
          "Byttet motorolje, oljefilter og luftfilter. Kontrollert hydraulikksystem. Alt OK.",
        performed_by: "Lars Erik Dahl",
        date: "2026-01-15",
        next_due_date: overdueDate.toISOString().split("T")[0], // overdue
      },
      {
        machine_id: inserted[1].id,
        title: "Hydraulikkreparasjon",
        description:
          "Identifisert lekkasje i hovedsylinder. Venter på reservedeler fra Caterpillar.",
        performed_by: "Marte Skogen",
        date: "2026-03-20",
        next_due_date: upcomingDate.toISOString().split("T")[0],
      },
    ])
    .returning();

  console.log(`Inserted ${logs.length} maintenance logs`);
  console.log("Seeding complete!");
}

seed().catch(console.error);
