import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";
export async function POST(req: Request) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const { data: authRow, error: authErr } = await supabaseAdmin
      .from("staff_auth")
      .select("staff_id, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (authErr || !authRow) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, authRow.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const { data: staff, error: staffErr } = await supabaseAdmin
      .from("staff")
      .select("id, name, email, department")
      .eq("id", authRow.staff_id)
      .maybeSingle();

    if (staffErr || !staff) {
      return NextResponse.json({ error: "Staff record not found" }, { status: 500 });
    }

    return NextResponse.json({ staff });
  } catch (e) {
    console.error("[/api/staff/login] unexpected error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
