import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseServer";
import Sidebar from "@/components/portal/Sidebar";

async function ensureUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const name  = session?.user?.name ?? null;
  if (!email) return;

  await supabaseAdmin
    .from("app_user")
    .upsert([{ email, name }], { onConflict: "email", ignoreDuplicates: false });
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await ensureUser();
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-0 px-4 py-4">
        <Sidebar />
        <section className="h-[calc(100vh-2rem)] flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
