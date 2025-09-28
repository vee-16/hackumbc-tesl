"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User2 } from "lucide-react";

type Status = "to_do" | "in_progress" | "completed";

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: Status;
  priority: string | null;
  department: string | null;
  created_at: string;
  time_estimate_minutes: number | null;
  user: {
    name: string | null;
    email: string | null;
    organization: string | null;
  } | null;
};

function statusBadgeClasses(status: Status) {
  if (status === "completed")
    return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (status === "in_progress")
    return "border-blue-200 text-blue-700 bg-blue-50";
  return "border-slate-200 text-slate-700 bg-slate-50";
}

export default function UnassignedTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const res = await fetch(`/api/staff/unassigned/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load ticket");
        setTicket(body.ticket);
      } catch (e: any) {
        setErr(e.message || "Error loading ticket");
      }
    }
    if (id) void load();
  }, [id]);

  async function claim() {
    if (!ticket) return;
    setErr("");
    const staffRaw =
      typeof window !== "undefined"
        ? localStorage.getItem("staff_session")
        : null;
    if (!staffRaw) {
      router.replace("/staff/login");
      return;
    }
    const staff = JSON.parse(staffRaw);
    const res = await fetch("/api/staff/unassigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticket.id, staff_id: staff.id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error || "Failed to claim ticket");
      return;
    }
    router.push("/staff/tickets");
  }

  if (err)
    return (
      <div className="p-8 text-center text-red-600">Error: {err}</div>
    );
  if (!ticket)
    return <div className="p-8 text-center">Loading ticket…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/staff/unassigned"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-500"
          onClick={claim}
        >
          Claim Ticket
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>{ticket.title}</CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className={statusBadgeClasses(ticket.status)}>
              {ticket.status.replace("_", " ")}
            </Badge>
            {ticket.priority && (
              <Badge
                variant="outline"
                className="border-slate-200 text-slate-700 bg-slate-50"
              >
                {ticket.priority}
              </Badge>
            )}
            {ticket.department && (
              <Badge
                variant="outline"
                className="border-slate-200 text-slate-700 bg-slate-50"
              >
                {ticket.department}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 whitespace-pre-wrap">{ticket.message}</p>

          {ticket.user && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <User2 className="h-4 w-4 text-slate-500" />
                Customer Details
              </div>
              <p className="mt-1">Name: {ticket.user.name ?? "N/A"}</p>
              <p>Email: {ticket.user.email ?? "N/A"}</p>
              <p>Organization: {ticket.user.organization ?? "N/A"}</p>
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500">
            Estimated time:{" "}
            {ticket.time_estimate_minutes
              ? `${ticket.time_estimate_minutes} minutes`
              : "—"}
          </p>

          <p className="text-xs text-slate-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
