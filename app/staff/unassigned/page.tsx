"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

type Status = "to_do" | "in_progress" | "completed";

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: Status;
  priority: string | null;
  department: string | null;
  created_at: string;
};

function statusBadgeClasses(status: Status) {
  if (status === "completed") return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (status === "in_progress") return "border-blue-200 text-blue-700 bg-blue-50";
  return "border-slate-200 text-slate-700 bg-slate-50";
}

export default function UnassignedTicketsPage(): JSX.Element {
  const router = useRouter();
  const [staff, setStaff] = useState<{ id: string; name: string; department: string } | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("staff_session") : null;
      if (!raw) {
        router.replace("/staff/login");
        return;
      }
      const s = JSON.parse(raw);
      if (!s?.id) throw new Error("invalid session");
      setStaff(s);
    } catch {
      if (typeof window !== "undefined") localStorage.removeItem("staff_session");
      router.replace("/staff/login");
    }
  }, [router]);

  const load = useCallback(async () => {
    setErr("");
    setTickets(null);
    const res = await fetch("/api/staff/unassigned");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error || "Failed to load unassigned tickets");
      setTickets([]);
      return;
    }
    setTickets(body.tickets || []);
  }, []);

  useEffect(() => {
    if (staff) void load();
  }, [staff, load]);

  async function claim(ticketId: string) {
    if (!staff?.id) return;
    setErr("");
    const res = await fetch("/api/staff/unassigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, staff_id: staff.id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error || "Failed to claim ticket");
      return;
    }
    await load();
  }

  if (!staff) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Unassigned Tickets</h1>
          <p className="text-slate-600 text-sm">
            Viewing all tickets not yet assigned • Signed in as {staff.name}
          </p>
        </div>
        <Link href="/staff/tickets">
          <Button variant="outline">My Assigned Tickets</Button>
        </Link>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {tickets === null ? (
        <div className="py-12 text-center text-slate-600">Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div className="py-16 text-center text-slate-600">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2">No unassigned tickets.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusBadgeClasses(t.status)}>
                    {t.status.replace("_", " ")}
                  </Badge>
                  {t.department && (
                    <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">
                      {t.department}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 line-clamp-2">{t.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Created {new Date(t.created_at).toLocaleString()}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                    onClick={() => claim(t.id)}
                  >
                    Claim
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/staff/unassigned/${t.id}`)}
                  >
                    Preview
                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
