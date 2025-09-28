"use client";

import type { JSX } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle2, Info } from "lucide-react";

type Ticket = {
  id: string;
  title: string;
  message: string;
  status: "to_do" | "in_progress" | "completed";
  created_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TicketsPage() {
  const { data, error, isLoading } = useSWR<{ tickets: Ticket[] }>(
    "/api/tickets",
    fetcher
  );

  const tickets = data?.tickets ?? [];
  const inProgress = tickets.filter((t) => t.status === "in_progress");
  const completed = tickets.filter((t) => t.status === "completed");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Support Tickets
          </h1>
          <p className="mt-1 text-slate-600">
            Track your support requests and view status.
          </p>
        </div>
        <Link href="/portal/submit-ticket">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-500">New Ticket</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Tickets"
          value={tickets.length}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <Stat
          label="In Progress"
          value={inProgress.length}
          icon={<Clock className="h-5 w-5" />}
        />
        <Stat
          label="Completed"
          value={completed.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <Stat
          label="Awaiting Routing"
          value={tickets.filter((t) => t.status === "to_do").length}
          icon={<Info className="h-5 w-5" />}
        />
      </div>

      {/* Content */}
      <Card className="mt-6 border-slate-200">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-600">Loading…</div>
          ) : error ? (
            <div className="py-16 text-center text-red-600">
              Failed to load tickets.
            </div>
          ) : tickets.length === 0 ? (
            <div className="grid place-items-center gap-4 py-16 text-center text-slate-600">
              <MessageSquare className="h-8 w-8 text-slate-400" />
              <div>No tickets found</div>
              <Link href="/portal/submit-ticket">
                <Button className="bg-indigo-600 hover:bg-indigo-500">
                  Submit Your First Ticket
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-6">
                    <div className="font-medium text-slate-900">{t.title}</div>
                    <div className="line-clamp-1 text-sm text-slate-600">
                      {t.message}
                    </div>
                  </div>
                  <div className="sm:col-span-3 text-sm text-slate-600">
                    {new Date(t.created_at).toLocaleString()}
                  </div>
                  <div className="sm:col-span-2">
                    <Badge
                      variant="outline"
                      className={
                        t.status === "completed"
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                          : t.status === "in_progress"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : "border-slate-200 text-slate-700 bg-slate-50"
                      }
                    >
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <Link href={`/portal/tickets/${t.id}`}>
                      <Button variant="outline" className="px-3 py-2 text-xs border-slate-200">
                        View
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
                label,
                value,
                icon,
              }: {
  label: string;
  value: number;
  icon: JSX.Element;
}) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-slate-500">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <div className="mt-2 text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
