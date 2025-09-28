"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Paperclip, CheckCircle2, Clock, Info } from "lucide-react";

type Status = "to_do" | "in_progress" | "completed";

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: Status;
  priority: string | null;
  department: string | null;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  time_estimate_minutes: number | null;
  staff_id: string;
};

function statusBadgeClasses(status: Status) {
  if (status === "completed") return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (status === "in_progress") return "border-blue-200 text-blue-700 bg-blue-50";
  return "border-slate-200 text-slate-700 bg-slate-50";
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "in_progress") return <Clock className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

export default function StaffTicketView() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [staff, setStaff] = useState<{ id: string; name: string; department: string } | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("staff_session");
    if (!raw) {
      router.replace("/staff/login");
      return;
    }
    try {
      const s = JSON.parse(raw);
      if (!s?.id) throw new Error();
      setStaff(s);
    } catch {
      localStorage.removeItem("staff_session");
      router.replace("/staff/login");
    }
  }, [router]);

  useEffect(() => {
    async function load() {
      if (!staff?.id || !params?.id) return;
      setLoading(true);
      setErr("");
      const res = await fetch(`/api/staff/tickets/${params.id}?staff_id=${staff.id}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(body.error || "Failed to load ticket");
        setTicket(null);
      } else {
        setTicket(body.ticket);
      }
      setLoading(false);
    }
    load();
  }, [staff?.id, params?.id]);

  const statusValue = useMemo<Status | undefined>(() => ticket?.status, [ticket]);

  async function updateStatus(next: Status) {
    if (!ticket || !staff) return;
    setSaving(true);
    setErr("");
    const res = await fetch(`/api/staff/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, staff_id: staff.id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error || "Failed to update status");
    } else {
      setTicket(body.ticket);
    }
    setSaving(false);
  }

  if (!staff) return <div className="p-8 text-center">Loading…</div>;
  if (loading) return <div className="p-8 text-center">Loading ticket…</div>;
  if (err && !ticket) {
    return (
      <div className="p-8">
        <Link href="/staff/tickets" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to tickets
        </Link>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      </div>
    );
  }
  if (!ticket) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2">
            <Link href="/staff/tickets" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to tickets
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>

        <Badge variant="outline" className={statusBadgeClasses(ticket.status)}>
          <span className="mr-1 inline-flex"><StatusIcon status={ticket.status} /></span>
          {ticket.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Priority</div>
            <div className="mt-1 font-medium">{ticket.priority ?? "Unclassified"}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Department</div>
            <div className="mt-1 font-medium">{ticket.department ?? "Unassigned"}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">Time Estimate</div>
            <div className="mt-1 font-medium">
              {ticket.time_estimate_minutes != null ? `${ticket.time_estimate_minutes} min` : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-slate-700">{ticket.message}</p>
        </CardContent>
      </Card>

      <Card className="mt-4 border-slate-200">
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

      <Card className="mt-4 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select
              value={statusValue}
              onValueChange={(v: Status) => updateStatus(v)}
              disabled={saving}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="to_do">To do</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => router.push("/staff/tickets")} disabled={saving}>
              Back to list
            </Button>
          </div>

          {err && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
