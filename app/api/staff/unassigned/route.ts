import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ticket")
    .select("id, title, message, status, priority, department, created_at")
    .is("staff_id", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data ?? [] });
}

export async function POST(req: Request) {
  try {
    const { ticket_id, staff_id } = (await req.json()) as {
      ticket_id?: string;
      staff_id?: string;
    };

    if (!ticket_id || !staff_id) {
      return NextResponse.json({ error: "Missing ticket_id or staff_id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("ticket")
      .update({ staff_id, updated_at: new Date().toISOString() })
      .eq("id", ticket_id)
      .is("staff_id", null)
      .select("id, staff_id")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Ticket already claimed" }, { status: 409 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
