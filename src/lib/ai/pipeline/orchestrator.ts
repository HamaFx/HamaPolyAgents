import { AnalystAgent } from "@/lib/ai/agents/analyst";
import { ExecutorAgent } from "@/lib/ai/agents/executor";
import { ResearcherAgent } from "@/lib/ai/agents/researcher";
import { RiskManagerAgent } from "@/lib/ai/agents/risk-manager";
import { buildSemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { TIMEOUTS } from "@/lib/ai/pipeline/constants";
import { serializeError, withTimeout } from "@/lib/ai/pipeline/runner";
import {
  addAgentOutput,
  createPipelineRun,
  getPipelineRunDetail,
  updatePipelineRun
} from "@/lib/store/memory";
import { nowIso, round } from "@/lib/utils";

export interface RunPipelineOptions {
  teamId: string;
  marketId: string;
  triggerType?: "manual" | "scheduled";
  executeTrades?: boolean;
}

export class PipelineOrchestrator {
  private readonly researcher = new ResearcherAgent();
  private readonly analyst = new AnalystAgent();
  private readonly riskManager = new RiskManagerAgent();
  private readonly executor = new ExecutorAgent();

  async run(options: RunPipelineOptions) {
    const run = createPipelineRun(options.teamId, options.marketId, options.triggerType ?? "manual");
    const started = Date.now();
    let totalTokens = 0;
    let totalCost = 0;

    try {
      const anchor = buildSemanticAnchor(options.teamId, options.marketId);

      const researchResult = await withTimeout(
        this.researcher.execute(anchor),
        TIMEOUTS.RESEARCHER,
        "Researcher stage"
      );
      totalTokens += researchResult.tokensUsed;
      totalCost += researchResult.costEstimate;

      addAgentOutput(run.id, {
        agentRole: "researcher",
        stageOrder: 1,
        inputData: { anchor },
        outputData: researchResult.output as unknown as Record<string, unknown>,
        reasoning: researchResult.reasoning,
        tokensUsed: researchResult.tokensUsed,
        latencyMs: researchResult.latencyMs,
        status: "completed"
      });

      const analysisResult = await withTimeout(
        this.analyst.execute({ anchor, research: researchResult.output }),
        TIMEOUTS.ANALYST,
        "Analyst stage"
      );
      totalTokens += analysisResult.tokensUsed;
      totalCost += analysisResult.costEstimate;

      addAgentOutput(run.id, {
        agentRole: "analyst",
        stageOrder: 2,
        inputData: {
          research: researchResult.output,
          anchor
        },
        outputData: analysisResult.output as unknown as Record<string, unknown>,
        reasoning: analysisResult.reasoning,
        tokensUsed: analysisResult.tokensUsed,
        latencyMs: analysisResult.latencyMs,
        status: "completed"
      });

      const riskResult = await withTimeout(
        this.riskManager.execute({
          teamId: options.teamId,
          anchor,
          analysis: analysisResult.output
        }),
        TIMEOUTS.RISK_MANAGER,
        "Risk manager stage"
      );
      totalTokens += riskResult.tokensUsed;
      totalCost += riskResult.costEstimate;

      addAgentOutput(run.id, {
        agentRole: "risk_manager",
        stageOrder: 3,
        inputData: {
          analysis: analysisResult.output,
          anchor
        },
        outputData: riskResult.output as unknown as Record<string, unknown>,
        reasoning: riskResult.reasoning,
        tokensUsed: riskResult.tokensUsed,
        latencyMs: riskResult.latencyMs,
        status: "completed"
      });

      if (!options.executeTrades) {
        updatePipelineRun(run.id, {
          status: riskResult.output.decision === "veto" ? "vetoed" : "completed",
          totalTokensUsed: totalTokens,
          totalCostEstimate: round(totalCost, 6),
          totalLatencyMs: Date.now() - started,
          completedAt: nowIso()
        });

        const detail = getPipelineRunDetail(run.id);
        return detail;
      }

      if (riskResult.output.decision === "veto") {
        addAgentOutput(run.id, {
          agentRole: "executor",
          stageOrder: 4,
          inputData: {
            analysis: analysisResult.output,
            risk: riskResult.output
          },
          outputData: {
            executed: false,
            reason: "veto"
          },
          reasoning: "Execution skipped after risk veto.",
          tokensUsed: 0,
          latencyMs: 0,
          status: "skipped"
        });

        updatePipelineRun(run.id, {
          status: "vetoed",
          totalTokensUsed: totalTokens,
          totalCostEstimate: round(totalCost, 6),
          totalLatencyMs: Date.now() - started,
          completedAt: nowIso()
        });

        const detail = getPipelineRunDetail(run.id);
        return detail;
      }

      const executionResult = await withTimeout(
        this.executor.execute({
          teamId: options.teamId,
          marketId: options.marketId,
          pipelineRunId: run.id,
          analysis: analysisResult.output,
          risk: riskResult.output
        }),
        TIMEOUTS.EXECUTOR,
        "Executor stage"
      );

      addAgentOutput(run.id, {
        agentRole: "executor",
        stageOrder: 4,
        inputData: {
          analysis: analysisResult.output,
          risk: riskResult.output
        },
        outputData: executionResult.output as unknown as Record<string, unknown>,
        reasoning: executionResult.reasoning,
        tokensUsed: executionResult.tokensUsed,
        latencyMs: executionResult.latencyMs,
        status: executionResult.output.executed ? "completed" : "skipped"
      });

      updatePipelineRun(run.id, {
        status: "completed",
        totalTokensUsed: totalTokens,
        totalCostEstimate: round(totalCost, 6),
        totalLatencyMs: Date.now() - started,
        completedAt: nowIso()
      });

      return getPipelineRunDetail(run.id);
    } catch (error) {
      const message = serializeError(error);
      updatePipelineRun(run.id, {
        status: "failed",
        errorMessage: message,
        totalTokensUsed: totalTokens,
        totalCostEstimate: round(totalCost, 6),
        totalLatencyMs: Date.now() - started,
        completedAt: nowIso()
      });

      addAgentOutput(run.id, {
        agentRole: "executor",
        stageOrder: 99,
        inputData: {},
        outputData: {},
        reasoning: "Pipeline failed before completion.",
        tokensUsed: 0,
        latencyMs: 0,
        status: "failed",
        errorMessage: message
      });

      return getPipelineRunDetail(run.id);
    }
  }
}
