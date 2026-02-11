"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CurvePoint {
  time: string;
  value: number;
}

export function DrawdownChart({ data }: { data: CurvePoint[] }) {
  return (
    <section className="surface h-72 p-4">
      <h3 className="headline text-lg">Drawdown Curve</h3>
      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis tick={{ fill: "#6f7d9a", fontSize: 11 }} stroke="#1d2a48" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1524",
              border: "1px solid #1d2a48",
              color: "#f2f6ff",
              borderRadius: 12
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#ff4d67" fill="rgba(255, 77, 103, 0.22)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
