"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Briefcase, Home, Medal, Users } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Markets", icon: Home },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/leaderboard", label: "Ranks", icon: Medal }
] satisfies Array<{ href: Route; label: string; icon: typeof Home }>;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-30 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-bgCard/95 p-1.5 shadow-panel backdrop-blur lg:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex flex-1 flex-col items-center rounded-xl py-2 text-[10px]",
              active ? "bg-accentBlue/20 text-textPrimary" : "text-textMuted"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
