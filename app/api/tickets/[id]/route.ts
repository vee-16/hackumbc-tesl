import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 must be Promise
) {
  try {
    const { id } = await context.params; // 👈 await it

    if (!id) {
      return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("ticket").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[tickets DELETE]", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
