import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getOrCreateAppUser } from "@/lib/dbUsers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in app_user
    const userId = await getOrCreateAppUser(
      email,
      session.user?.name ?? undefined
    );

    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert ticket, linked to the authenticated user
    const { data, error } = await supabaseAdmin
      .from("ticket")
      .insert({
        title,
        message,
        user_id: userId,
        status: "to_do",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ticket: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
