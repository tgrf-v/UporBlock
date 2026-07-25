"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  History,
  LayoutDashboard,
  LogOut,
  Plug,
  Settings,
  Video,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/submit", label: "Kirim Video", icon: Video },
  { href: "/sites", label: "Situs", icon: Settings },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/connect-extension", label: "Ekstensi", icon: Plug },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-signal font-display text-sm font-black text-ink">
            U
          </span>
          <span className="hidden font-display text-sm font-bold tracking-wide sm:block">
            UPORBLOCK
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 font-data text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full transition-colors ${
                    active ? "bg-signal" : "bg-transparent"
                  }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {email && (
            <span className="hidden font-data text-xs text-muted-foreground md:block">
              {email}
            </span>
          )}
          <button
            onClick={logout}
            title="Logout"
            className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-all hover:border-alarm hover:text-alarm"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
