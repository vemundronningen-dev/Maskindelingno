import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loan_requests, bookings, machines } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status, response_message } = body;

    // Fetch the current loan request to get machine_id, dates, requester_organization_id
    const [existing] = await db
      .select()
      .from(loan_requests)
      .where(eq(loan_requests.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (status === "approved") {
      // Update loan request status
      const [updated] = await db
        .update(loan_requests)
        .set({ status, response_message: response_message ?? null, updated_at: sql`NOW()` })
        .where(eq(loan_requests.id, id))
        .returning();

      // Insert booking
      await db.insert(bookings).values({
        machine_id: existing.machine_id,
        loan_request_id: existing.id,
        from_date: existing.from_date,
        to_date: existing.to_date,
        borrower_organization_id: existing.requester_organization_id,
      });

      // Update machine status to "booked"
      await db
        .update(machines)
        .set({ status: "booked" })
        .where(eq(machines.id, existing.machine_id));

      return NextResponse.json(updated);
    } else if (status === "rejected") {
      const [updated] = await db
        .update(loan_requests)
        .set({ status, response_message: response_message ?? null, updated_at: sql`NOW()` })
        .where(eq(loan_requests.id, id))
        .returning();

      return NextResponse.json(updated);
    } else if (status === "returned") {
      // Update loan request
      const [updated] = await db
        .update(loan_requests)
        .set({ status, response_message: response_message ?? null, updated_at: sql`NOW()` })
        .where(eq(loan_requests.id, id))
        .returning();

      // Update machine status back to "available"
      await db
        .update(machines)
        .set({ status: "available" })
        .where(eq(machines.id, existing.machine_id));

      // Delete the booking associated with this loan_request_id
      await db
        .delete(bookings)
        .where(eq(bookings.loan_request_id, existing.id));

      return NextResponse.json(updated);
    } else {
      // Generic status update
      const [updated] = await db
        .update(loan_requests)
        .set({ status, response_message: response_message ?? null, updated_at: sql`NOW()` })
        .where(eq(loan_requests.id, id))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
