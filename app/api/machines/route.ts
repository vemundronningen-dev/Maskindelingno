import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { machines, organizations, projects } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
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
      .orderBy(desc(machines.created_at));

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      make,
      model,
      serial_number,
      type,
      status,
      owner_organization_id,
      project_id,
      responsible_name,
      responsible_phone,
      responsible_email,
      notes,
      image_url,
    } = body;

    const [machine] = await db
      .insert(machines)
      .values({
        make,
        model,
        serial_number,
        type,
        status,
        owner_organization_id,
        project_id: project_id ?? null,
        responsible_name,
        responsible_phone,
        responsible_email,
        notes,
        image_url,
      })
      .returning();

    return NextResponse.json(machine, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
