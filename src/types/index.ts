export type UUID = string;

export type MarketCategory =
  | "politics"
  | "sports"
  | "crypto"
  | "tech"
  | "world"
  | "science"
  | "entertainment";

export type MarketStatus = "open" | "closed" | "resolved";
export type MarketSide = "yes" | "no";
export type RiskProfileName = "conservative" | "moderate" | "aggressive";

export interface Profile {
  id: UUID;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Market {
  id: UUID;
  question: string;
  description: string;
  category: MarketCategory;
  resolutionDate: string;
  currentYesPrice: number;
  currentNoPrice: number;
  volume: number;
  status: MarketStatus;
  resolvedOutcome?: MarketSide;
  createdAt: string;
}

export interface AgentTeam {
  id: UUID;
  userId: UUID;
  name: string;
  avatar: string;
  strategyPrompt: string;
  riskProfile: RiskProfileName;
  bankroll: number;
  initialBankroll: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AgentRole =
  | "orchestrator"
  | "researcher"
  | "analyst"
  | "risk_manager"
  | "executor";

export interface AgentConfig {
  id: UUID;
  teamId: UUID;
  agentRole: AgentRole;
  config: Record<string, unknown>;
  modelOverride?: string;
  isActive: boolean;
}

export interface Position {
  id: UUID;
  teamId: UUID;
  marketId: UUID;
  side: MarketSide;
  shares: number;
  avgPrice: number;
  status: "open" | "closed";
  realizedPnl: number;
  createdAt: string;
}

export interface Trade {
  id: UUID;
  teamId?: UUID;
  userId?: UUID;
  marketId: UUID;
  pipelineRunId?: UUID;
  action: "buy" | "sell";
  side: MarketSide;
  shares: number;
  price: number;
  amount: number;
  createdAt: string;
}

export type PipelineRunStatus =
  | "running"
  | "completed"
  | "failed"
  | "timeout"
  | "vetoed";

export interface PipelineRun {
  id: UUID;
  teamId: UUID;
  marketId: UUID;
  status: PipelineRunStatus;
  triggerType: "manual" | "scheduled";
  totalTokensUsed: number;
  totalCostEstimate: number;
  totalLatencyMs: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface AgentOutput {
  id: UUID;
  pipelineRunId: UUID;
  agentRole: Exclude<AgentRole, "orchestrator">;
  stageOrder: number;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  reasoning: string;
  tokensUsed: number;
  latencyMs: number;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  errorMessage?: string;
  createdAt: string;
}

export interface PriceHistoryPoint {
  id: UUID;
  marketId: UUID;
  yesPrice: number;
  noPrice: number;
  volume: number;
  recordedAt: string;
}

export interface ActivityItem {
  id: UUID;
  kind:
    | "trade"
    | "pipeline_run"
    | "risk_veto"
    | "market_resolution"
    | "team_created";
  title: string;
  description: string;
  teamId?: UUID;
  marketId?: UUID;
  createdAt: string;
}

export interface TeamPerformance {
  teamId: UUID;
  totalPnl: number;
  roiPct: number;
  winRate: number;
  brierScore: number;
  riskAdjustedReturn: number;
}

export interface MarketWithMeta extends Market {
  recentTrades: Trade[];
  priceHistory: PriceHistoryPoint[];
}

export interface TeamWithMeta extends AgentTeam {
  configs: AgentConfig[];
  positions: Position[];
  recentTrades: Trade[];
  recentRuns: PipelineRun[];
  performance: TeamPerformance;
}
