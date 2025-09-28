"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageSquare, TicketCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const items = [
  { href: "/portal/submit-ticket", label: "Submit Ticket", icon: MessageSquare },
  { href: "/portal/tickets", label: "My Tickets", icon: TicketCheck },
  {href: "/portal/assistant", label: "Chat Support", icon: MessageSquare }
];

<Link href="/portal/assistant" className="text-sm text-indigo-700 hover:underline">AI Assistant</Link>


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data } = useSession();
  const user = data?.user;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white rounded-xl">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white">🛡️</div>
        <div>
          <div className="text-sm font-semibold">IT Support</div>
          <div className="text-xs text-slate-500">Customer Portal</div>
        </div>
      </div>

      <nav className="mt-2 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <Separator className="mb-3" />
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="font-medium">{user?.name ?? "Guest"}</div>
            <div className="text-xs text-slate-500">{user?.email ?? ""}</div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => {
            signOut({ redirect: false });
            router.push("/");
          }}
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
