"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Welcome to
        </h1>
        <div className="text-2xl font-semibold tracking-tight text-emerald-700">CivicLab</div>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue</p>

        <Button
          onClick={() => signIn("google", { callbackUrl: "/portal" })}
          variant="outline"
          className="mt-6 w-full border-slate-200 text-slate-800 hover:bg-slate-50"
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </div>
    </main>
  );
}
