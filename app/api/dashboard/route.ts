import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { machines, organizations, maintenance_logs, loan_requests, bookings } from "@/lib/schema";
import { eq, lt, desc, count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Count totals
    const [totals] = await db
      .select({
        totalMachines: count(),
        available: sql<number>`COUNT(*) FILTER (WHERE ${machines.status} = 'available')`,
        booked: sql<number>`COUNT(*) FILTER (WHERE ${machines.status} = 'booked')`,
        underMaintenance: sql<number>`COUNT(*) FILTER (WHERE ${machines.status} = 'under_maintenance')`,
      })
      .from(machines);

    // Available machines this week (max 5) with org name
    const availableThisWeek = await db
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
      })
      .from(machines)
      .leftJoin(organizations, eq(machines.owner_organization_id, organizations.id))
      .where(eq(machines.status, "available"))
      .limit(5);

    // Overdue maintenance (next_due_date < today)
    const overdueMaintenance = await db
      .select({
        id: maintenance_logs.id,
        machine_id: maintenance_logs.machine_id,
        title: maintenance_logs.title,
        description: maintenance_logs.description,
        performed_by: maintenance_logs.performed_by,
        date: maintenance_logs.date,
        next_due_date: maintenance_logs.next_due_date,
        created_at: maintenance_logs.created_at,
        machine_name: sql<string>`${machines.make} || ' ' || ${machines.model}`,
      })
      .from(maintenance_logs)
      .leftJoin(machines, eq(maintenance_logs.machine_id, machines.id))
      .where(lt(maintenance_logs.next_due_date, today));

    // Pending loan requests
    const pendingRequests = await db
      .select({
        id: loan_requests.id,
        machine_id: loan_requests.machine_id,
        requester_organization_id: loan_requests.requester_organization_id,
        requester_name: loan_requests.requester_name,
        requester_phone: loan_requests.requester_phone,
        requester_email: loan_requests.requester_email,
        from_date: loan_requests.from_date,
        to_date: loan_requests.to_date,
        purpose: loan_requests.purpose,
        status: loan_requests.status,
        response_message: loan_requests.response_message,
        created_at: loan_requests.created_at,
        updated_at: loan_requests.updated_at,
        machine_name: sql<string>`${machines.make} || ' ' || ${machines.model}`,
        requester_org_name: organizations.name,
      })
      .from(loan_requests)
      .leftJoin(machines, eq(loan_requests.machine_id, machines.id))
      .leftJoin(organizations, eq(loan_requests.requester_organization_id, organizations.id))
      .where(eq(loan_requests.status, "pending"))
      .orderBy(desc(loan_requests.created_at));

    // Recent bookings (last 5)
    const recentBookings = await db
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
      .orderBy(desc(bookings.created_at))
      .limit(5);

    return NextResponse.json({
      totalMachines: Number(totals.totalMachines),
      available: Number(totals.available),
      booked: Number(totals.booked),
      underMaintenance: Number(totals.underMaintenance),
      availableThisWeek,
      overdueMaintenance,
      pendingRequests,
      recentBookings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
