// app/api/tickets/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getOrCreateAppUser } from "@/lib/dbUsers";

type TicketRow = {
  id: string;
  title: string;
  message: string;
  status: "to_do" | "in_progress" | "completed";
  priority: string | null;
  department: string | null;
  time_remaining: string | null;
  attachment: string | null;
  user_id: string;
  staff_id: string | null;
  created_at: string;
  updated_at: string;
};

type Params = { params: { id: string } };


export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 } as ResponseInit);
  }

  const userId = await getOrCreateAppUser(email, session.user?.name ?? undefined);

  const { data, error } = await supabaseAdmin
    .from("ticket")
    .select(
      `
      id, title, message, status, priority, department, time_remaining, attachment,
      user_id, staff_id, created_at, updated_at,
      staff:staff_id ( id, name, email, department )
      `
    )
    .eq("id", params.id)
    .eq("user_id", userId)  // ensure ownership
    .maybeSingle<TicketRow & { staff: { id: string; name: string | null; email: string | null; department: string | null } | null }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 } as ResponseInit);
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 } as ResponseInit);
  }

  return NextResponse.json({ ticket: data }, { status: 200 } as ResponseInit);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ must await
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");

  if (!id || !userId) {
    return NextResponse.json({ error: "Missing id or user_id" }, { status: 400 });
  }

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from("ticket")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (row.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: delErr } = await supabaseAdmin.from("ticket").delete().eq("id", id);

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
