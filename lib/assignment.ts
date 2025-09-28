import { supabaseAdmin } from "@/lib/supabaseServer";

export async function pickAssignee(department: string): Promise<string | null> {
  const dept = (department || "").toLowerCase();

  const { data, error } = await supabaseAdmin.rpc("pick_assignee", {
    p_department: dept,
  });

  if (error) {
    console.error("[pickAssignee] rpc error:", error);
    return null;
  }

  return data as string | null;
}
