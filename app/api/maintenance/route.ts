import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { maintenance_logs } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machine_id, title, description, performed_by, date, next_due_date } =
      body;

    if (!machine_id || !title || !date) {
      return NextResponse.json(
        { error: "machine_id, title, and date are required" },
        { status: 400 }
      );
    }

    const [log] = await db
      .insert(maintenance_logs)
      .values({
        machine_id: parseInt(machine_id),
        title,
        description,
        performed_by,
        date,
        next_due_date: next_due_date || null,
      })
      .returning();

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
