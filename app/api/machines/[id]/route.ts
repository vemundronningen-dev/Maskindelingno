import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { machines, organizations, projects, maintenance_logs, bookings } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const [row] = await db
      .select({
        id: machines.id,
        make: machines.make,
        model: machines.model,
        serial_number: machines.serial_number,
        type: machines.type,
        status: machines.status,
        owner_organization_id: machines.owner_organization_id,
        project_id: machines.project_id,
        responsible_name: machines.responsible_name,
        responsible_phone: machines.responsible_phone,
        responsible_email: machines.responsible_email,
        notes: machines.notes,
        image_url: machines.image_url,
        created_at: machines.created_at,
        owner_org_name: organizations.name,
        project_name: projects.name,
      })
      .from(machines)
      .leftJoin(organizations, eq(machines.owner_organization_id, organizations.id))
      .leftJoin(projects, eq(machines.project_id, projects.id))
      .where(eq(machines.id, id));

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const logs = await db
      .select()
      .from(maintenance_logs)
      .where(eq(maintenance_logs.machine_id, id))
      .orderBy(desc(maintenance_logs.date));

    const machineBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.machine_id, id))
      .orderBy(desc(bookings.created_at));

    return NextResponse.json({ machine: row, maintenance_logs: logs, bookings: machineBookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    const fields = [
      "make", "model", "serial_number", "type", "status",
      "owner_organization_id", "project_id", "responsible_name",
      "responsible_phone", "responsible_email", "notes",
    ];

    for (const field of fields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Allow explicit null for project_id (unassign from project)
    if ("project_id" in body && body.project_id === null) {
      updates.project_id = null;
    }

    const [machine] = await db
      .update(machines)
      .set(updates)
      .where(eq(machines.id, id))
      .returning();

    if (!machine) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(machine);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const [machine] = await db
      .delete(machines)
      .where(eq(machines.id, id))
      .returning();

    if (!machine) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
