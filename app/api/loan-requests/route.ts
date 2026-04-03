import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loan_requests, machines, organizations } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
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
        requester_org_name: sql<string>`requester_org.name`,
        owner_org_name: sql<string>`owner_org.name`,
      })
      .from(loan_requests)
      .leftJoin(machines, eq(loan_requests.machine_id, machines.id))
      .leftJoin(
        sql`organizations AS requester_org`,
        sql`${loan_requests.requester_organization_id} = requester_org.id`
      )
      .leftJoin(
        sql`organizations AS owner_org`,
        sql`${machines.owner_organization_id} = owner_org.id`
      )
      .orderBy(desc(loan_requests.created_at));

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
      machine_id,
      requester_organization_id,
      requester_name,
      requester_phone,
      requester_email,
      from_date,
      to_date,
      purpose,
    } = body;

    const [loanRequest] = await db
      .insert(loan_requests)
      .values({
        machine_id,
        requester_organization_id,
        requester_name,
        requester_phone,
        requester_email,
        from_date,
        to_date,
        purpose,
      })
      .returning();

    return NextResponse.json(loanRequest, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
