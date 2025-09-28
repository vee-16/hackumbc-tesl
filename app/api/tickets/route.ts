import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyTicket } from "@/lib/classifier"; // your Gemini/ML classifier

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role required for writes
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ticket")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tickets: data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, user_id } = body;

    if (!title || !message || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const classified = await classifyTicket(title, message);

    const { data: staffList, error: staffErr } = await supabaseAdmin
      .from("staff")
      .select("id, department, ticket_assigned");

    if (staffErr || !staffList) {
      return NextResponse.json(
        { error: "Failed to fetch staff list" },
        { status: 500 }
      );
    }

    const deptStaff = staffList.filter(
      (s) => s.department === classified.department
    );

    let staffId: string | null = null;

    if (deptStaff.length > 0) {
      deptStaff.sort(
        (a, b) => (a.ticket_assigned ?? 0) - (b.ticket_assigned ?? 0)
      );
      staffId = deptStaff[0].id;
    }

    const { data, error } = await supabaseAdmin
      .from("ticket")
      .insert([
        {
          title,
          message,
          status: "in_progress",
          user_id,
          priority: classified.priority,
          department: classified.department,
          time_estimate_minutes: classified.time_estimate_minutes,
          staff_id: staffId,
        },
      ])
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (staffId) {
      await supabaseAdmin.rpc("increment_ticket_count", {
        staff_id: staffId,
      });
    }

    return NextResponse.json({ ticket: data });
  } catch (err: any) {
    console.error("[tickets POST]", err);
    return NextResponse.json(
      { error: err.message || "Failed to create ticket" },
      { status: 500 }
    );
  }
}
