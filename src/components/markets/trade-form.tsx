"use client";

import { useMemo, useState, useTransition } from "react";

interface TradeFormProps {
  marketId: string;
  teamId?: string;
  yesPrice: number;
  noPrice: number;
}

export function TradeForm({ marketId, teamId, yesPrice, noPrice }: TradeFormProps) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(250);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string>("");

  const indicativePrice = useMemo(() => (side === "yes" ? yesPrice : noPrice), [side, yesPrice, noPrice]);

  function submitTrade() {
    startTransition(async () => {
      setResult("");
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          marketId,
          side,
          amount,
          teamId
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        setResult(payload.error ?? "Trade failed.");
        return;
      }

      setResult(`Executed ${side.toUpperCase()} for $${amount.toFixed(2)}.`);
    });
  }

  return (
    <div className="surface p-4">
      <h3 className="headline text-lg">Place Manual Trade</h3>
      <p className="mt-1 text-xs text-textSecondary">Price is approximate and updates after execution.</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("yes")}
          className={`rounded-lg border px-3 py-2 text-sm ${
            side === "yes"
              ? "border-accentGreen/45 bg-accentGreen/15 text-accentGreen"
              : "border-border text-textSecondary"
          }`}
        >
          Buy YES
        </button>
        <button
          onClick={() => setSide("no")}
          className={`rounded-lg border px-3 py-2 text-sm ${
            side === "no"
              ? "border-accentRed/45 bg-accentRed/15 text-accentRed"
              : "border-border text-textSecondary"
          }`}
        >
          Buy NO
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-bgInput/50 p-3">
        <label className="text-xs text-textSecondary">Amount (USD)</label>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value || 0))}
          className="mt-1 w-full rounded-md border border-border bg-bgPrimary px-3 py-2 text-sm text-textPrimary outline-none focus:border-accentBlue"
        />
        <p className="mt-2 text-xs text-textMuted">Indicative entry: {indicativePrice.toFixed(2)}c</p>
      </div>

      <button
        onClick={submitTrade}
        disabled={isPending}
        className="mt-3 w-full rounded-lg bg-accentBlue px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {isPending ? "Executing..." : "Execute Trade"}
      </button>

      {result ? <p className="mt-3 text-xs text-textSecondary">{result}</p> : null}
    </div>
  );
}
