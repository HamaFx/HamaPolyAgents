import { AnalystOutput } from "@/lib/ai/schemas/analyst-output";
import { RiskManagerOutput } from "@/lib/ai/schemas/risk-manager-output";

export function buildExecutorBrief(analysis: AnalystOutput, risk: RiskManagerOutput): {
  side: "yes" | "no";
  amount: number;
} {
  const side = analysis.synthesis.signal.includes("no") ? "no" : "yes";
  return {
    side,
    amount: risk.approved_amount
  };
}
