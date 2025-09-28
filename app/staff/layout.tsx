"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/staff/tickets", label: "My Tickets" },
  { href: "/staff/unassigned", label: "Unassigned Tickets" },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("staff_session");
    router.push("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold tracking-tight">Staff Portal</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100",
                pathname === item.href ? "bg-slate-200 text-slate-900" : "text-slate-600"
              )}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="mt-6 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Log Out
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-slate-50 p-6">{children}</main>
    </div>
  );
}
