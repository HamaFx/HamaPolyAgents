import { BaseAgent } from "@/lib/ai/agents/base-agent";
import { buildExecutorBrief } from "@/lib/ai/prompts/executor-prompt";
import { AnalystOutput } from "@/lib/ai/schemas/analyst-output";
import { ExecutorOutput } from "@/lib/ai/schemas/executor-output";
import { RiskManagerOutput } from "@/lib/ai/schemas/risk-manager-output";
import { getTeamById, placeTrade } from "@/lib/store/memory";

export interface ExecutorInput {
  teamId: string;
  marketId: string;
  pipelineRunId: string;
  analysis: AnalystOutput;
  risk: RiskManagerOutput;
}

export class ExecutorAgent extends BaseAgent<ExecutorInput, ExecutorOutput> {
  constructor() {
    super("executor");
  }

  protected async run(input: ExecutorInput) {
    const team = getTeamById(input.teamId);
    if (!team) {
      throw new Error("Team not found for execution.");
    }

    if (input.risk.decision === "veto" || input.risk.approved_amount <= 0) {
      return {
        output: {
          executed: false,
          new_bankroll: team.bankroll,
          skip_reason: "Trade vetoed by risk manager or approved amount is zero."
        },
        reasoning: "Execution skipped due to risk decision.",
        tokensUsed: 0,
        latencyMs: 0,
        costEstimate: 0
      };
    }

    const brief = buildExecutorBrief(input.analysis, input.risk);

    const result = placeTrade({
      marketId: input.marketId,
      side: brief.side,
      amount: input.risk.approved_amount,
      teamId: input.teamId,
      pipelineRunId: input.pipelineRunId
    });

    return {
      output: {
        executed: true,
        trade: {
          action: result.trade.action,
          side: result.trade.side,
          shares: result.trade.shares,
          price: result.trade.price,
          amount: result.trade.amount,
          price_impact: result.market.currentYesPrice - (result.market.currentNoPrice ? 100 - result.market.currentNoPrice : 50)
        },
        new_bankroll: team.bankroll,
        new_position: result.position
          ? {
              side: result.position.side,
              shares: result.position.shares,
              avg_price: result.position.avgPrice
            }
          : undefined
      },
      reasoning: "Trade executed against AMM and records updated.",
      tokensUsed: 0,
      latencyMs: 0,
      costEstimate: 0
    };
  }
}
