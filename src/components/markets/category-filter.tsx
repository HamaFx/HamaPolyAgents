"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

interface CategoryFilterProps {
  categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.get("category") ?? "all";

  function setCategory(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      next.delete("category");
    } else {
      next.set("category", value);
    }
    router.push(`${pathname}?${next.toString()}` as Route);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {["all", ...categories].map((category) => (
        <button
          key={category}
          onClick={() => setCategory(category)}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] transition",
            selected === category
              ? "border-accentBlue/50 bg-accentBlue/15 text-textPrimary"
              : "border-border text-textSecondary hover:text-textPrimary"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
