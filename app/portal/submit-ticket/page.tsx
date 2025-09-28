"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SubmitTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Title and message are required.");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting ticket:", { title, message, user: session?.user });

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("Response from /api/tickets:", { status: res.status, data });

      if (!res.ok) {
        alert(data.error ?? "Failed to submit ticket");
        return;
      }

      setTitle("");
      setMessage("");
      router.push("/portal/tickets");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Submit Support Ticket
      </h1>
      <p className="mt-1 text-slate-600">
        Describe your issue and we will get on it.
      </p>

      <Card className="mt-6 border-slate-200">
        <CardHeader className="rounded-t-xl bg-gradient-to-r from-indigo-600 to-blue-500 py-3 text-white">
          <CardTitle className="text-base font-semibold">
            New Support Request
          </CardTitle>
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
              type="submit"
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
