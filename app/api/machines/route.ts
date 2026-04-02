import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { machines } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db
      .select()
      .from(machines)
      .orderBy(desc(machines.created_at));
    return NextResponse.json(all);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      make,
      model,
      year,
      serial_number,
      status,
      location,
      notes,
      responsible_name,
      responsible_phone,
      responsible_email,
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    const [machine] = await db
      .insert(machines)
      .values({
        name,
        type,
        make,
        model,
        year: year ? parseInt(year) : null,
        serial_number,
        status: status ?? "active",
        location,
        notes,
        responsible_name,
        responsible_phone,
        responsible_email,
      })
      .returning();

    return NextResponse.json(machine, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
