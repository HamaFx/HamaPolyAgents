import { z } from "zod";

export const pipelineStageSchema = z.enum(["created", "research", "analysis", "risk_eval", "execution", "completed", "failed"]);
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export const pipelineStatusSchema = z.enum(["running", "completed", "failed", "timeout", "vetoed"]);
export type PipelineStatus = z.infer<typeof pipelineStatusSchema>;

export const pipelineStateSchema = z.object({
  runId: z.string(),
  stage: pipelineStageSchema,
  startedAt: z.string(),
  completedAt: z.string().optional(),
  errors: z.array(z.string()).default([])
});

export type PipelineState = z.infer<typeof pipelineStateSchema>;
