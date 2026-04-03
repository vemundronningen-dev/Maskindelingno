import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, organizations } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const rows = await db
      .select({
        from_date: bookings.from_date,
        to_date: bookings.to_date,
        borrower_org_name: organizations.name,
      })
      .from(bookings)
      .leftJoin(organizations, eq(bookings.borrower_organization_id, organizations.id))
      .where(eq(bookings.machine_id, id));

    return NextResponse.json({ bookedRanges: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
