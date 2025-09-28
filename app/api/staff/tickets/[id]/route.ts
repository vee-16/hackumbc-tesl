// app/api/staff/tickets/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

const VALID = new Set(["to_do", "in_progress", "completed"]);

// GET /api/staff/tickets/:id?staff_id=UUID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const staffId = url.searchParams.get("staff_id");
  if (!staffId) return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });

  // Only return the ticket if it is assigned to this staff member
  const { data, error } = await supabaseAdmin
    .from("ticket")
    .select("id, title, message, status, priority, department, attachment, created_at, updated_at, time_estimate_minutes, staff_id")
    .eq("id", params.id)
    .eq("staff_id", staffId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ticket: data });
}

// PATCH /api/staff/tickets/:id
// body: { status: "to_do" | "in_progress" | "completed", staff_id: UUID }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status, staff_id } = (await req.json()) as { status?: string; staff_id?: string };

    if (!status || !staff_id) {
      return NextResponse.json({ error: "Missing status or staff_id" }, { status: 400 });
    }
    if (!VALID.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update only if this ticket belongs to the staff member
    const { data, error } = await supabaseAdmin
      .from("ticket")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("staff_id", staff_id)
      .select("id, title, message, status, priority, department, attachment, created_at, updated_at, time_estimate_minutes, staff_id")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Not found or not assigned to you" }, { status: 404 });

    return NextResponse.json({ ticket: data });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
