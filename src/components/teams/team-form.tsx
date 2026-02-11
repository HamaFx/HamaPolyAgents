"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface TeamFormValues {
  name: string;
  strategyPrompt: string;
  riskProfile: "conservative" | "moderate" | "aggressive";
  bankroll: number;
}

const initialValues: TeamFormValues = {
  name: "",
  strategyPrompt: "",
  riskProfile: "moderate",
  bankroll: 10000
};

export function TeamForm() {
  const [values, setValues] = useState<TeamFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function update<K extends keyof TeamFormValues>(key: K, value: TeamFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      setError("");

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Could not create team.");
        return;
      }

      router.push(`/teams/${payload.data.id}` as Route);
      router.refresh();
    });
  }

  return (
    <div className="surface p-5">
      <h2 className="headline text-2xl">Create Agent Team</h2>
      <p className="mt-1 text-sm text-textSecondary">Define strategy, risk profile, and bankroll baseline.</p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm text-textSecondary">
          Team name
          <input
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Nebula Quant"
            className="mt-1 w-full rounded-lg border border-border bg-bgInput/70 px-3 py-2 text-sm text-textPrimary outline-none focus:border-accentBlue"
          />
        </label>

        <label className="block text-sm text-textSecondary">
          Strategy prompt
          <textarea
            value={values.strategyPrompt}
            onChange={(e) => update("strategyPrompt", e.target.value)}
            rows={5}
            placeholder="Balanced approach. Prefer clear resolution criteria and mispriced odds."
            className="mt-1 w-full rounded-lg border border-border bg-bgInput/70 px-3 py-2 text-sm text-textPrimary outline-none focus:border-accentBlue"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-textSecondary">
            Risk profile
            <select
              value={values.riskProfile}
              onChange={(e) => update("riskProfile", e.target.value as TeamFormValues["riskProfile"])}
              className="mt-1 w-full rounded-lg border border-border bg-bgInput/70 px-3 py-2 text-sm text-textPrimary outline-none focus:border-accentBlue"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </label>

          <label className="block text-sm text-textSecondary">
            Starting bankroll
            <input
              type="number"
              min={100}
              value={values.bankroll}
              onChange={(e) => update("bankroll", Number(e.target.value || 0))}
              className="mt-1 w-full rounded-lg border border-border bg-bgInput/70 px-3 py-2 text-sm text-textPrimary outline-none focus:border-accentBlue"
            />
          </label>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-accentRed">{error}</p> : null}

      <button
        onClick={submit}
        disabled={isPending}
        className="mt-4 rounded-lg bg-accentBlue px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create Team"}
      </button>
    </div>
  );
}
