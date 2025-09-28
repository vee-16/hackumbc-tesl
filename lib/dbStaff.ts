import { supabaseAdmin } from "@/lib/supabaseServer";

type Row = { id: string };

export async function getOrCreateStaff(email: string, name?: string, department?: string): Promise<string> {
  const { data: existing, error: selErr } = await supabaseAdmin
    .from("staff")
    .select("id")
    .eq("email", email)
    .maybeSingle<Row>();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("staff")
    .insert([{ email, name, department }])
    .select("id")
    .single<Row>();

  if (insErr?.code === "23505") {
    const { data: again, error: againErr } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", email)
      .maybeSingle<Row>();
    if (againErr || !again) throw againErr ?? new Error("Staff not found after conflict");
    return again.id;
  }

  if (insErr || !inserted) throw insErr ?? new Error("Insert failed");
  return inserted.id;
}
