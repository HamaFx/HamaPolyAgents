import { BaseAgent } from "@/lib/ai/agents/base-agent";
import { buildRiskManagerPrompt } from "@/lib/ai/prompts/risk-manager-prompt";
import { SemanticAnchor } from "@/lib/ai/prompts/semantic-anchor";
import { analystOutputSchema, AnalystOutput } from "@/lib/ai/schemas/analyst-output";
import { riskManagerOutputSchema, RiskManagerOutput } from "@/lib/ai/schemas/risk-manager-output";
import { callStructuredLLM } from "@/lib/ai/llm";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import { computePositionSize } from "@/lib/risk/position-sizer";
import { runPortfolioChecks } from "@/lib/risk/portfolio-checks";
import { getPositionsForTeam, getTeamById } from "@/lib/store/memory";
import { clamp, pct, round } from "@/lib/utils";

export interface RiskManagerInput {
  teamId: string;
  anchor: SemanticAnchor;
  analysis: AnalystOutput;
}

function signalToDirection(signal: AnalystOutput["synthesis"]["signal"]): "yes" | "no" | "hold" {
  if (signal === "hold") {
    return "hold";
  }
  return signal.includes("no") ? "no" : "yes";
}

export class RiskManagerAgent extends BaseAgent<RiskManagerInput, RiskManagerOutput> {
  constructor() {
    super("risk_manager");
  }

  protected async run(input: RiskManagerInput) {
    const validatedAnalysis = analystOutputSchema.parse(input.analysis);
    const direction = signalToDirection(validatedAnalysis.synthesis.signal);

    const edge = Math.abs(input.anchor.market.currentYesPrice - 50) / 100;
    const sizing = computePositionSize({
      edge,
      confidence: validatedAnalysis.synthesis.confidence,
      oddsDecimal: 2,
      bankroll: input.anchor.currentBankroll,
      maxSingleBetPct: input.anchor.maxBetPercent
    });

    const suggestedByAnalyst =
      (validatedAnalysis.synthesis.suggested_size_pct / 100) *
      ((input.anchor.maxBetPercent / 100) * input.anchor.currentBankroll);

    const proposedAmount = round(Math.max(sizing, suggestedByAnalyst), 2);

    const team = getTeamById(input.teamId);
    if (!team) {
      throw new Error("Team not found for risk check.");
    }

    const positions = getPositionsForTeam(input.teamId);
    const checks = runPortfolioChecks({
      riskProfile: team.riskProfile,
      team,
      market: input.anchor.market,
      positions,
      amount: proposedAmount,
      confidence: validatedAnalysis.synthesis.confidence
    });

    const prompt = buildRiskManagerPrompt(input.anchor, validatedAnalysis);
    const llmResult = await callStructuredLLM({
      model: "gpt-4o",
      systemPrompt: SYSTEM_PROMPTS.riskManager,
      userPrompt: prompt,
      schema: riskManagerOutputSchema,
      fallback: () => {
        const openExposure = positions.reduce((sum, p) => sum + p.avgPrice * p.shares, 0);
        const drawdown = pct(team.initialBankroll - team.bankroll, team.initialBankroll);

        if (direction === "hold") {
          return {
            decision: "veto",
            approved_amount: 0,
            approved_size_pct: 0,
            reasoning: "No actionable signal from analyst.",
            risk_flags: [
              {
                flag: "no_signal",
                severity: "info",
                description: "Analyst returned HOLD."
              }
            ],
            portfolio_health: {
              total_exposure_pct: pct(openExposure, Math.max(team.bankroll, 1)),
              drawdown_pct: drawdown,
              category_concentrations: input.anchor.categoryExposure
            }
          } as RiskManagerOutput;
        }

        if (!checks.approved) {
          return {
            decision: "veto",
            approved_amount: 0,
            approved_size_pct: 0,
            reasoning: checks.reasons.join(" "),
            risk_flags: checks.reasons.map((reason, index) => ({
              flag: `risk_${index + 1}`,
              severity: "critical" as const,
              description: reason
            })),
            portfolio_health: {
              total_exposure_pct: pct(openExposure, Math.max(team.bankroll, 1)),
              drawdown_pct: drawdown,
              category_concentrations: input.anchor.categoryExposure
            }
          } as RiskManagerOutput;
        }

        const approvedAmount = checks.reducedAmount ?? proposedAmount;
        const decision = checks.reducedAmount ? "reduce" : "approve";

        return {
          decision,
          approved_amount: round(approvedAmount, 2),
          approved_size_pct: round(pct(approvedAmount, Math.max(team.bankroll, 1)), 2),
          reasoning:
            decision === "reduce"
              ? "Trade approved with reduced size to respect portfolio constraints."
              : "Trade approved within all current limits.",
          risk_flags: checks.reasons.map((reason, index) => ({
            flag: `warn_${index + 1}`,
            severity: "warning" as const,
            description: reason
          })),
          portfolio_health: {
            total_exposure_pct: pct(openExposure, Math.max(team.bankroll, 1)),
            drawdown_pct: drawdown,
            category_concentrations: input.anchor.categoryExposure
          }
        } as RiskManagerOutput;
      }
    });

    const deterministicDecision = checks.approved ? (checks.reducedAmount ? "reduce" : "approve") : "veto";

    const output: RiskManagerOutput = {
      ...llmResult.output,
      decision: deterministicDecision,
      approved_amount: deterministicDecision === "veto" ? 0 : round(checks.reducedAmount ?? proposedAmount, 2),
      approved_size_pct:
        deterministicDecision === "veto"
          ? 0
          : round(
              clamp(pct(checks.reducedAmount ?? proposedAmount, Math.max(team.bankroll, 1)), 0, input.anchor.maxBetPercent),
              2
            ),
      reasoning:
        deterministicDecision === "veto"
          ? checks.reasons.join(" ") || llmResult.output.reasoning
          : llmResult.output.reasoning
    };

    return {
      output,
      reasoning: "Risk manager completed portfolio checks and final trade gating.",
      tokensUsed: llmResult.tokensUsed,
      latencyMs: 0,
      costEstimate: llmResult.costEstimate
    };
  }
}
