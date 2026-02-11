import { z } from "zod";

export const executorOutputSchema = z.object({
  executed: z.boolean(),
  trade: z
    .object({
      action: z.enum(["buy", "sell"]),
      side: z.enum(["yes", "no"]),
      shares: z.number(),
      price: z.number(),
      amount: z.number(),
      price_impact: z.number()
    })
    .optional(),
  new_bankroll: z.number(),
  new_position: z
    .object({
      side: z.string(),
      shares: z.number(),
      avg_price: z.number()
    })
    .optional(),
  skip_reason: z.string().optional()
});

export type ExecutorOutput = z.infer<typeof executorOutputSchema>;
