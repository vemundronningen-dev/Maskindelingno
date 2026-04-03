import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, machines, organizations } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: bookings.id,
        machine_id: bookings.machine_id,
        loan_request_id: bookings.loan_request_id,
        from_date: bookings.from_date,
        to_date: bookings.to_date,
        borrower_organization_id: bookings.borrower_organization_id,
        created_at: bookings.created_at,
        machine_name: sql<string>`${machines.make} || ' ' || ${machines.model}`,
        borrower_org_name: organizations.name,
      })
      .from(bookings)
      .leftJoin(machines, eq(bookings.machine_id, machines.id))
      .leftJoin(organizations, eq(bookings.borrower_organization_id, organizations.id))
      .orderBy(desc(bookings.created_at));

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { machine_id, loan_request_id, from_date, to_date, borrower_organization_id } = body;

    const [booking] = await db
      .insert(bookings)
      .values({ machine_id, loan_request_id, from_date, to_date, borrower_organization_id })
      .returning();

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
