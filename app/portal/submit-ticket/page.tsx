"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SubmitTicketPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Require an authenticated session before submitting
    if (status !== "authenticated" || !session?.user?.email) {
      alert("Please sign in to submit a ticket.");
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: only send title/message; server uses getServerSession to resolve the user
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Failed to submit");
        return;
      }

      setTitle("");
      setMessage("");
      router.push("/portal/tickets");
    } finally {
      setLoading(false);
    }
  }

  // Block UI while session state is loading or user is being redirected
  if (status === "loading") {
    return <div className="p-8 text-center text-slate-600">Loading session…</div>;
  }
  if (status !== "authenticated") {
    return null; // redirect happens; avoid flicker
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Submit Support Ticket
      </h1>
      <p className="mt-1 text-slate-600">
        Signed in as <span className="font-medium">{session.user?.email}</span>
      </p>

      <Card className="mt-6 border-slate-200">
        <CardHeader className="rounded-t-xl bg-gradient-to-r from-indigo-600 to-blue-500 py-3 text-white">
          <CardTitle className="text-base font-semibold">New Support Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="issue">Issue Summary *</Label>
              <Input
                id="issue"
                className="mt-2"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>
            <div>
              <Label htmlFor="detail">Detailed Description *</Label>
              <Textarea
                id="detail"
                className="mt-2"
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide as much detail as possible..."
              />
            </div>
            <Button
              disabled={loading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
