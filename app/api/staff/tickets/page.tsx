import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle2, Info } from "lucide-react";

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: "to_do" | "in_progress" | "completed";
  created_at: string;
};

function statusBadgeClasses(status: Ticket["status"]) {
  if (status === "completed")
    return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (status === "in_progress")
    return "border-blue-200 text-blue-700 bg-blue-50";
  return "border-slate-200 text-slate-700 bg-slate-50";
}

export default async function StaffTicketsPage() {
  const sessionCookie = (await cookies()).get("staff_session")?.value;
  if (!sessionCookie) {
    redirect("/staff/login");
  }

  const { staff_id } = JSON.parse(sessionCookie);

  // 2. Fetch tickets assigned to this staff member
  const { data: tickets, error } = await supabaseAdmin
    .from("ticket")
    .select("id, title, message, status, created_at")
    .eq("staff_id", staff_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[staff/tickets] fetch error:", error.message);
    return <div className="p-6 text-red-600">Failed to load tickets</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Tickets Assigned to Me
        </h1>
        <Link href="/staff/unassigned">
          <Button variant="outline">View Unassigned Tickets</Button>
        </Link>
      </div>

      {(!tickets || tickets.length === 0) ? (
        <div className="py-16 text-center text-slate-600">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2">No tickets assigned to you.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t.title}</CardTitle>
                <Badge variant="outline" className={statusBadgeClasses(t.status)}>
                  {t.status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {t.message}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Created {new Date(t.created_at).toLocaleString()}
                </p>
                <div className="mt-3">
                  <Link href={`/portal/tickets/${t.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
