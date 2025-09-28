import { ReactNode } from "react";
import Link from "next/link";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-0 px-4 py-4">
        <section className="h-[calc(100vh-2rem)] flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
