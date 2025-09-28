import { supabaseAdmin } from "@/lib/supabaseServer";

export async function getOrCreateAppUser(email: string, name?: string): Promise<string> {
  const { data: existing, error: selErr } = await supabaseAdmin
    .from("app_user")
    .select("id")
    .eq("email", email)
    .maybeSingle<{ id: string }>();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("app_user")
    .insert([{ email, name }])     // no id → let DB generate
    .select("id")
    .single<{ id: string }>();

  if (insErr?.code === "23505") {
    const { data: again, error: againErr } = await supabaseAdmin
      .from("app_user")
      .select("id")
      .eq("email", email)
      .maybeSingle<{ id: string }>();
    if (againErr || !again) throw againErr ?? new Error("User not found after conflict");
    return again.id;
  }
  if (insErr || !inserted) throw insErr ?? new Error("Insert failed");
  return inserted.id;
}
