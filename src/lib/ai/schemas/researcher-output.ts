import { z } from "zod";

export const researcherOutputSchema = z.object({
  market_summary: z.string(),
  key_factors: z.array(
    z.object({
      factor: z.string(),
      impact: z.enum(["bullish", "bearish", "neutral"]),
      importance: z.number().min(0).max(1)
    })
  ),
  odds_assessment: z.object({
    current_implied_prob: z.number(),
    researcher_estimated_prob: z.number(),
    edge: z.number()
  }),
  data_confidence: z.number().min(0).max(1),
  related_markets: z.array(z.string())
});

export type ResearcherOutput = z.infer<typeof researcherOutputSchema>;
