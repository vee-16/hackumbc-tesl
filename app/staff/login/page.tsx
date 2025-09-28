"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StaffLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error || "Login failed");
      return;
    }

    localStorage.setItem("staff_session", JSON.stringify(body.staff));
    router.push("/staff/tickets");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-md space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Staff Login</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">Sign in</Button>
      </form>
    </main>
  );
}
