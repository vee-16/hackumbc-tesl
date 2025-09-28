import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }  // 👈 must be Promise
) {
  const { id } = await context.params;  // 👈 await it

  const { data, error } = await supabaseAdmin
    .from("ticket")
    .select(`
      id,
      title,
      message,
      status,
      priority,
      department,
      time_estimate_minutes,
      created_at,
      user:app_user!ticket_user_id_fkey (
        id,
        name,
        email
      )
    `)
    .eq("id", id)
    .is("staff_id", null)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket: data });
}
