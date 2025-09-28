import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getOrCreateAppUser } from "@/lib/dbUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {ArrowLeft, Paperclip, User2, Clock, CheckCircle2, Info, Delete} from "lucide-react";
import {DeleteTicket} from "@/components/portal/DeleteTicket";

type Staff = { id: string; name: string | null; email: string | null; department: string | null } | null;

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: "to_do" | "in_progress" | "completed";
  priority: string | null;
  department: string | null;
  time_estimate_minutes: number | null;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  staff: Staff;
};

function statusBadgeClasses(status: Ticket["status"]) {
  if (status === "completed") return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (status === "in_progress") return "border-blue-200 text-blue-700 bg-blue-50";
  return "border-slate-200 text-slate-700 bg-slate-50";
}

function StatusIcon({ status }: { status: Ticket["status"] }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "in_progress") return <Clock className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

async function loadTicket(id: string): Promise<Ticket | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const userId = await getOrCreateAppUser(email, session.user?.name ?? undefined);

  const { data, error } = await supabaseAdmin
    .from("ticket")
    .select(`
      id, title, message, status, priority, department, time_estimate_minutes, attachment, created_at, updated_at,
      staff:staff_id ( id, name, email, department )
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as Ticket) ?? null;
}

export default async function TicketDetails(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // 👈 await params first
  const ticket = await loadTicket(id);
  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2">
            <Link href="/portal/tickets" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to tickets
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {ticket.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <Badge variant="outline" className={statusBadgeClasses(ticket.status)}>
          <span className="mr-1 inline-flex"><StatusIcon status={ticket.status} /></span>
          {ticket.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Priority</div>
            <div className="mt-1 font-medium capitalize">{ticket.priority ?? "Unclassified"}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Department</div>
            <div className="mt-1 font-medium capitalize">{ticket.department ?? "Unassigned"}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Estimated Time</div>
            <div className="mt-1 font-medium">
              {ticket.time_estimate_minutes != null ? `${ticket.time_estimate_minutes} min` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Assigned Staff</div>
            <div className="mt-1 flex items-center gap-2">
              <User2 className="h-4 w-4 text-slate-500" />
              <div className="font-medium">
                {ticket.staff?.name ?? "Unassigned"}
              </div>
              {ticket.staff?.department && (
                <span className="text-xs text-slate-500">• {ticket.staff.department}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-slate-700">
          <p className="whitespace-pre-wrap">{ticket.message}</p>
        </CardContent>
      </Card>

      <Card className="mt-4 border-slate-200  mb-4">
        <CardHeader>
          <CardTitle className="text-base">Attachment</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.attachment ? (
            <a
              href={ticket.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
            >
              <Paperclip className="h-4 w-4 text-slate-500" />
              <span className="truncate max-w-xs">{ticket.attachment.split("/").pop()}</span>
            </a>
          ) : (
            <div className="text-sm text-slate-500">No attachment</div>
          )}
        </CardContent>
      </Card>

      <DeleteTicket id={ticket.id} />
    </div>
  );
}
