"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PriceHistoryPoint } from "@/types";

interface OddsChartProps {
  data: PriceHistoryPoint[];
}

export function OddsChart({ data }: OddsChartProps) {
  return (
    <div className="surface h-72 p-4">
      <div className="mb-4">
        <h3 className="headline text-lg">Odds History</h3>
        <p className="text-xs text-textSecondary">YES/NO price evolution</p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <XAxis
            dataKey="recordedAt"
            tickFormatter={(value: string) =>
              new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value))
            }
            tick={{ fill: "#6f7d9a", fontSize: 11 }}
            stroke="#1d2a48"
          />
          <YAxis domain={[0, 100]} tick={{ fill: "#6f7d9a", fontSize: 11 }} stroke="#1d2a48" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1524",
              border: "1px solid #1d2a48",
              color: "#f2f6ff",
              borderRadius: 12
            }}
          />
          <Line type="monotone" dataKey="yesPrice" stroke="#16c784" strokeWidth={2.4} dot={false} />
          <Line type="monotone" dataKey="noPrice" stroke="#ff4d67" strokeWidth={2.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
