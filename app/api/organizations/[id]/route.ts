import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));

    if (!org) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const updates: Partial<{ name: string; type: string }> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.type !== undefined) updates.type = body.type;

    const [org] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, id))
      .returning();

    if (!org) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const [org] = await db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    if (!org) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
