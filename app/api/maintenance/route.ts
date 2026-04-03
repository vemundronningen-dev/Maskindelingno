import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { maintenance_logs } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { machine_id, title, description, performed_by, date, next_due_date } = body;

    const [log] = await db
      .insert(maintenance_logs)
      .values({
        machine_id,
        title,
        description,
        performed_by,
        date,
        next_due_date: next_due_date ?? null,
      })
      .returning();

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
