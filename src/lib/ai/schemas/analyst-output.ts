import { z } from "zod";

export const analystOutputSchema = z.object({
  bull_case: z.object({
    argument: z.string(),
    confidence: z.number().min(0).max(1),
    key_points: z.array(z.string())
  }),
  bear_case: z.object({
    argument: z.string(),
    confidence: z.number().min(0).max(1),
    key_points: z.array(z.string())
  }),
  synthesis: z.object({
    signal: z.enum(["strong_buy_yes", "buy_yes", "hold", "buy_no", "strong_buy_no"]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    suggested_size_pct: z.number().min(0).max(100)
  })
});

export type AnalystOutput = z.infer<typeof analystOutputSchema>;
