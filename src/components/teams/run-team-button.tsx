"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface RunTeamButtonProps {
  teamId: string;
}

export function RunTeamButton({ teamId }: RunTeamButtonProps) {
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function trigger() {
    startTransition(async () => {
      setStatus("");
      const res = await fetch(`/api/teams/${teamId}/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          executeTrades: true
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        setStatus(payload.error ?? "Run failed");
        return;
      }

      const runId = payload.data.run.id;
      setStatus("Pipeline completed.");
      router.push(`/teams/${teamId}/runs/${runId}` as Route);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={trigger}
        disabled={isPending}
        className="rounded-lg bg-accentBlue px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {isPending ? "Running..." : "Run Pipeline"}
      </button>
      {status ? <p className="text-xs text-textSecondary">{status}</p> : null}
    </div>
  );
}
