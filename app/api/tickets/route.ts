// app/api/tickets/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getOrCreateAppUser } from "@/lib/dbUsers";
import { classifyTicket } from "@/lib/classifier";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: return tickets only for the logged-in user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // map auth user → app_user.id
    const userId = await getOrCreateAppUser(
      session.user.email,
      session.user.name ?? undefined
    );
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("ticket")
      .select("*")
      .eq("user_id", userId) // ✅ only this user’s tickets
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickets: data });
  } catch (err: any) {
    console.error("[tickets GET]", err);
    return NextResponse.json(
      { error: err.message || "Failed to load tickets" },
      { status: 500 }
    );
  }
}

// POST: unchanged except inserts user_id properly
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, message } = (await req.json().catch(() => ({}))) as {
      title?: string;
      message?: string;
    };

    if (!title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ensure user exists
    const userId = await getOrCreateAppUser(
      session.user.email,
      session.user.name ?? undefined
    );
    if (!userId) {
      return NextResponse.json(
        { error: "User could not be resolved" },
        { status: 500 }
      );
    }

    // classify
    const classified = await classifyTicket(title, message);
    if (!classified) {
      return NextResponse.json(
        { error: "Classification failed" },
        { status: 500 }
      );
    }

    // pick least busy staff in dept
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

    // insert ticket
    const { data, error } = await supabaseAdmin
      .from("ticket")
      .insert([
        {
          title,
          message,
          status: "in_progress",
          user_id: userId,
          priority: classified.priority,
          department: classified.department,
          time_estimate_minutes: classified.estimated_minutes,
          staff_id: staffId,
        },
      ])
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (staffId) {
      await supabaseAdmin.rpc("increment_ticket_count", { staff_id: staffId });
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
