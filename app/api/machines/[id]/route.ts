import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { machines, maintenance_logs } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const [machine] = await db
      .select()
      .from(machines)
      .where(eq(machines.id, id));

    if (!machine) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const logs = await db
      .select()
      .from(maintenance_logs)
      .where(eq(maintenance_logs.machine_id, id))
      .orderBy(desc(maintenance_logs.date));

    return NextResponse.json({ machine, logs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await db.delete(machines).where(eq(machines.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
