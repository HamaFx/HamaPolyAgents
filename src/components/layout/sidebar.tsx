"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, Home, Medal, Sparkles, Users } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Markets", icon: Home },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/markets", label: "Explorer", icon: BarChart3 }
] satisfies Array<{ href: Route; label: string; icon: typeof Home }>;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-[calc(100vh-3rem)] w-64 flex-col justify-between rounded-2xl border border-border/80 bg-bgCard/80 p-4 shadow-panel lg:flex">
      <div>
        <div className="mb-6 rounded-xl border border-accentBlue/30 bg-accentBlue/10 p-3">
          <p className="headline text-lg">AgentBets</p>
          <p className="mt-1 text-xs text-textSecondary">Investment committee for prediction markets.</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "border border-accentCyan/35 bg-accentCyan/10 text-textPrimary"
                    : "text-textSecondary hover:bg-bgCardHover hover:text-textPrimary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-border bg-bgInput/45 p-3 text-xs text-textSecondary">
        <p className="mb-1 flex items-center gap-1 text-textPrimary">
          <Sparkles className="h-3.5 w-3.5 text-accentCyan" />
          Pipeline intelligence
        </p>
        <p>Research, adversarial analysis, and deterministic risk checks in one execution chain.</p>
      </div>
    </aside>
  );
}
