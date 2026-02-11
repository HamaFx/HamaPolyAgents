import { z } from "zod";

export const riskManagerOutputSchema = z.object({
  decision: z.enum(["approve", "reduce", "veto"]),
  approved_amount: z.number().min(0),
  approved_size_pct: z.number().min(0).max(100),
  reasoning: z.string(),
  risk_flags: z.array(
    z.object({
      flag: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
      description: z.string()
    })
  ),
  portfolio_health: z.object({
    total_exposure_pct: z.number(),
    drawdown_pct: z.number(),
    category_concentrations: z.record(z.number())
  })
});

export type RiskManagerOutput = z.infer<typeof riskManagerOutputSchema>;
