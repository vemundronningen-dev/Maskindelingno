import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, organizations } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        organization_id: projects.organization_id,
        location: projects.location,
        start_date: projects.start_date,
        end_date: projects.end_date,
        created_at: projects.created_at,
        org_name: organizations.name,
      })
      .from(projects)
      .leftJoin(organizations, eq(projects.organization_id, organizations.id))
      .orderBy(desc(projects.created_at));

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, organization_id, location, start_date, end_date } = body;

    const [project] = await db
      .insert(projects)
      .values({ name, organization_id, location, start_date, end_date })
      .returning();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
