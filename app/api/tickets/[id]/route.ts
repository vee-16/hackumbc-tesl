import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getOrCreateAppUser } from "@/lib/dbUsers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getOrCreateAppUser(
      session.user.email,
      session.user.name ?? undefined
    );

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("ticket")
      .select(
        `
        id, title, message, status, priority, department, 
        time_estimate_minutes, attachment, created_at, updated_at,
        staff:staff_id ( id, name, email, department )
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) {
      return NextResponse.json(
        { error: "Ticket not found or not yours" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket: data });
  } catch (err: any) {
    console.error("[tickets GET by id]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/tickets/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getOrCreateAppUser(
      session.user.email,
      session.user.name ?? undefined
    );
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("ticket")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[tickets DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
