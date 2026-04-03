import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, machines, projects } from "@/lib/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const orgs = await db.select().from(organizations).orderBy(organizations.name);

    const result = await Promise.all(
      orgs.map(async (org) => {
        const [machineCount] = await db
          .select({ value: count() })
          .from(machines)
          .where(eq(machines.owner_organization_id, org.id));

        const [projectCount] = await db
          .select({ value: count() })
          .from(projects)
          .where(eq(projects.organization_id, org.id));

        return {
          ...org,
          machine_count: Number(machineCount.value),
          project_count: Number(projectCount.value),
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type } = body;

    const [org] = await db
      .insert(organizations)
      .values({ name, type })
      .returning();

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
