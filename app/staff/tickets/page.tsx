"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: "to_do" | "in_progress" | "completed";
  created_at: string;
};

function statusBadgeClasses(status: Ticket["status"]) {
  if (status === "completed") return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (status === "in_progress") return "border-blue-200 text-blue-700 bg-blue-50";
  return "border-slate-200 text-slate-700 bg-slate-50";
}

export default function StaffTicketsPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<{ id: string; name: string; email: string; department: string } | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("staff_session");
    if (!raw) {
      router.replace("/staff/login");
      return;
    }
    try {
      const s = JSON.parse(raw);
      if (!s?.id) throw new Error("Missing staff id");
      setStaff(s);
    } catch {
      localStorage.removeItem("staff_session");
      router.replace("/staff/login");
    }
  }, [router]);

  useEffect(() => {
    async function load() {
      if (!staff?.id) return;
      setErr("");
      setTickets(null);
      const res = await fetch(`/api/staff/tickets?staff_id=${staff.id}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(body.error || "Failed to load tickets");
        setTickets([]);
        return;
      }
      setTickets(body.tickets || []);
    }
    load();
  }, [staff]);

  if (!staff) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assigned to {staff.name}</h1>
          <p className="text-slate-600 text-sm">Department: {staff.department} </p>
        </div>
        <Link href="/staff/unassigned">
          <Button variant="outline">View unassigned</Button>
        </Link>
      </div>

      {err && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      {tickets === null ? (
        <div className="py-12 text-center text-slate-600">Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-slate-600">No tickets assigned to you.</div>
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
                <p className="text-sm text-slate-700 line-clamp-2">{t.message}</p>
                <p className="mt-2 text-xs text-slate-500">Created {new Date(t.created_at).toLocaleString()}</p>
                <div className="mt-3">
                  <Link href={`/staff/tickets/${t.id}`}>
                    <Button variant="outline" size="sm">View</Button>
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
