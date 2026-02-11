import { executeMarketTrade } from "@/lib/market/engine";
import { getRiskProfile } from "@/lib/risk/profiles";
import { nowIso, pct, round, uid } from "@/lib/utils";
import {
  ActivityItem,
  AgentConfig,
  AgentOutput,
  AgentTeam,
  Market,
  MarketCategory,
  MarketSide,
  PipelineRun,
  Position,
  PriceHistoryPoint,
  Profile,
  TeamPerformance,
  TeamWithMeta,
  Trade
} from "@/types";

const DEMO_USER_ID = "user-demo";
const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  name: "Demo Trader",
  createdAt: nowIso()
};

const MARKET_SEED: Array<{
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  yes: number;
  resolutionDate: string;
}> = [
  {
    id: "mkt-ai-regulation-2026",
    question: "Will the US pass new AI regulation before July 2026?",
    description:
      "Resolves YES if new federal AI legislation is signed into law by July 1, 2026. Executive orders alone do not count.",
    category: "politics",
    yes: 62,
    resolutionDate: "2026-07-01T00:00:00.000Z"
  },
  {
    id: "mkt-shutdown-q1-2026",
    question: "Will there be a government shutdown in Q1 2026?",
    description: "Resolves YES if a federal funding lapse causes a partial or full government shutdown in Q1 2026.",
    category: "politics",
    yes: 35,
    resolutionDate: "2026-03-31T23:59:59.000Z"
  },
  {
    id: "mkt-btc-150k-2026",
    question: "Will Bitcoin exceed $150,000 by end of 2026?",
    description: "Resolves YES if any major exchange reports BTC/USD >= 150,000 at any point before Jan 1, 2027.",
    category: "crypto",
    yes: 45,
    resolutionDate: "2026-12-31T23:59:59.000Z"
  },
  {
    id: "mkt-eth-flippening-2027",
    question: "Will Ethereum flip Bitcoin in market cap by 2027?",
    description: "Resolves YES if ETH market cap exceeds BTC market cap for at least 24 continuous hours before Jan 1, 2028.",
    category: "crypto",
    yes: 12,
    resolutionDate: "2027-12-31T23:59:59.000Z"
  },
  {
    id: "mkt-apple-ar-2026",
    question: "Will Apple release AR glasses in 2026?",
    description: "Resolves YES if Apple publicly launches and ships a dedicated AR glasses product in 2026.",
    category: "tech",
    yes: 58,
    resolutionDate: "2026-12-31T23:59:59.000Z"
  },
  {
    id: "mkt-openai-gpt5-june-2026",
    question: "Will OpenAI release GPT-5 before June 2026?",
    description: "Resolves YES if OpenAI publicly announces and releases GPT-5 before June 30, 2026.",
    category: "tech",
    yes: 73,
    resolutionDate: "2026-06-30T23:59:59.000Z"
  },
  {
    id: "mkt-real-madrid-cl-2026",
    question: "Will Real Madrid win the Champions League 2026?",
    description: "Resolves YES if Real Madrid are the official winners of the 2026 UEFA Champions League.",
    category: "sports",
    yes: 28,
    resolutionDate: "2026-05-31T23:59:59.000Z"
  },
  {
    id: "mkt-ai-beat-esports-2026",
    question: "Will an AI system beat a professional esports team in 2026?",
    description:
      "Resolves YES if an AI system defeats a professional top-tier esports team in an official or sanctioned exhibition in 2026.",
    category: "sports",
    yes: 22,
    resolutionDate: "2026-12-31T23:59:59.000Z"
  },
  {
    id: "mkt-global-temp-record-2026",
    question: "Will global temperatures set a new record in 2026?",
    description:
      "Resolves YES if recognized global climate datasets confirm 2026 as hottest year on record by annual mean.",
    category: "world",
    yes: 81,
    resolutionDate: "2026-12-31T23:59:59.000Z"
  },
  {
    id: "mkt-crewed-mars-2030",
    question: "Will a crewed Mars mission launch before 2030?",
    description: "Resolves YES if any human-crewed mission departs Earth with Mars as destination before Jan 1, 2030.",
    category: "science",
    yes: 18,
    resolutionDate: "2029-12-31T23:59:59.000Z"
  },
  {
    id: "mkt-streaming-best-picture-2027",
    question: "Will a streaming-only film win Best Picture at Oscars 2027?",
    description:
      "Resolves YES if the 2027 Academy Award for Best Picture goes to a film that had no traditional theatrical release.",
    category: "entertainment",
    yes: 41,
    resolutionDate: "2027-03-31T23:59:59.000Z"
  },
  {
    id: "mkt-bitcoin-legal-tender-2026",
    question: "Will a country adopt Bitcoin as legal tender in 2026?",
    description: "Resolves YES if a sovereign state officially enacts Bitcoin as legal tender during 2026.",
    category: "crypto",
    yes: 33,
    resolutionDate: "2026-12-31T23:59:59.000Z"
  }
];

interface AppStore {
  profiles: Profile[];
  markets: Market[];
  agentTeams: AgentTeam[];
  agentConfigs: AgentConfig[];
  positions: Position[];
  trades: Trade[];
  pipelineRuns: PipelineRun[];
  agentOutputs: AgentOutput[];
  priceHistory: PriceHistoryPoint[];
  activities: ActivityItem[];
}

declare global {
  // eslint-disable-next-line no-var
  var __agentbets_store__: AppStore | undefined;
}

function seededHistory(marketId: string, yesPrice: number): PriceHistoryPoint[] {
  const points = 28;
  const out: PriceHistoryPoint[] = [];
  for (let i = points; i >= 1; i -= 1) {
    const drift = Math.sin(i / 3) * 2.8;
    const random = (Math.random() - 0.5) * 2.6;
    const yes = Math.max(1, Math.min(99, round(yesPrice + drift + random, 2)));
    out.push({
      id: uid(),
      marketId,
      yesPrice: yes,
      noPrice: round(100 - yes, 2),
      volume: round(1800 + Math.random() * 6000, 2),
      recordedAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString()
    });
  }
  return out;
}

function createInitialStore(): AppStore {
  const createdAt = nowIso();
  const markets: Market[] = MARKET_SEED.map((seed) => ({
    id: seed.id,
    question: seed.question,
    description: seed.description,
    category: seed.category,
    resolutionDate: seed.resolutionDate,
    currentYesPrice: seed.yes,
    currentNoPrice: round(100 - seed.yes, 2),
    volume: round(15000 + Math.random() * 45000, 2),
    status: "open",
    createdAt
  }));

  const team: AgentTeam = {
    id: "team-alpha",
    userId: DEMO_USER_ID,
    name: "Alpha Team",
    avatar: "AT",
    strategyPrompt:
      "Balanced approach. Look for markets where odds seem mispriced. Prefer markets with clear resolution criteria. Avoid markets resolving more than 1 year out.",
    riskProfile: "moderate",
    bankroll: 10000,
    initialBankroll: 10000,
    isActive: true,
    createdAt,
    updatedAt: createdAt
  };

  const profile = getRiskProfile(team.riskProfile);

  const configs: AgentConfig[] = [
    {
      id: uid(),
      teamId: team.id,
      agentRole: "researcher",
      config: { searchDepth: "balanced", sourcePriority: ["market", "history"] },
      modelOverride: "gpt-4o-mini",
      isActive: true
    },
    {
      id: uid(),
      teamId: team.id,
      agentRole: "analyst",
      config: { style: "balanced", debateRounds: profile.debateRounds },
      modelOverride: "gpt-4o",
      isActive: true
    },
    {
      id: uid(),
      teamId: team.id,
      agentRole: "risk_manager",
      config: { strictness: "standard" },
      modelOverride: "gpt-4o",
      isActive: true
    },
    {
      id: uid(),
      teamId: team.id,
      agentRole: "executor",
      config: { tradeTiming: "immediate" },
      isActive: true
    }
  ];

  const priceHistory = markets.flatMap((market) => seededHistory(market.id, market.currentYesPrice));

  const activities: ActivityItem[] = [
    {
      id: uid(),
      kind: "team_created",
      title: "Alpha Team deployed",
      description: "Moderate risk profile with balanced value strategy.",
      teamId: team.id,
      createdAt
    }
  ];

  return {
    profiles: [DEMO_PROFILE],
    markets,
    agentTeams: [team],
    agentConfigs: configs,
    positions: [],
    trades: [],
    pipelineRuns: [],
    agentOutputs: [],
    priceHistory,
    activities
  };
}

function store(): AppStore {
  if (!global.__agentbets_store__) {
    global.__agentbets_store__ = createInitialStore();
  }
  return global.__agentbets_store__;
}

export interface MarketFilters {
  category?: MarketCategory;
  status?: "open" | "closed" | "resolved";
  search?: string;
  sort?: "volume" | "newest" | "yesPrice";
}

export interface TradesFilters {
  teamId?: string;
  marketId?: string;
  limit?: number;
}

export function getDefaultUserId(): string {
  return DEMO_USER_ID;
}

export function listMarkets(filters?: MarketFilters): Market[] {
  const db = store();

  let list = [...db.markets];

  if (filters?.category) {
    list = list.filter((market) => market.category === filters.category);
  }
  if (filters?.status) {
    list = list.filter((market) => market.status === filters.status);
  }
  if (filters?.search) {
    const needle = filters.search.toLowerCase();
    list = list.filter(
      (market) => market.question.toLowerCase().includes(needle) || market.description.toLowerCase().includes(needle)
    );
  }

  if (filters?.sort === "yesPrice") {
    list.sort((a, b) => b.currentYesPrice - a.currentYesPrice);
  } else if (filters?.sort === "newest") {
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else {
    list.sort((a, b) => b.volume - a.volume);
  }

  return list;
}

export function getMarketById(id: string): Market | undefined {
  return store().markets.find((market) => market.id === id);
}

export function getMarketDetail(id: string): {
  market: Market;
  recentTrades: Trade[];
  priceHistory: PriceHistoryPoint[];
} | null {
  const db = store();
  const market = db.markets.find((item) => item.id === id);
  if (!market) {
    return null;
  }

  const recentTrades = db.trades
    .filter((trade) => trade.marketId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  const priceHistory = db.priceHistory
    .filter((point) => point.marketId === id)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  return {
    market,
    recentTrades,
    priceHistory
  };
}

export function listTeams(userId = DEMO_USER_ID): AgentTeam[] {
  return store().agentTeams.filter((team) => team.userId === userId);
}

export function getTeamById(id: string): AgentTeam | undefined {
  return store().agentTeams.find((team) => team.id === id);
}

export function getTeamDetail(id: string): TeamWithMeta | null {
  const db = store();
  const team = db.agentTeams.find((item) => item.id === id);
  if (!team) {
    return null;
  }

  const configs = db.agentConfigs.filter((cfg) => cfg.teamId === id);
  const positions = db.positions.filter((position) => position.teamId === id);
  const recentTrades = db.trades
    .filter((trade) => trade.teamId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
  const recentRuns = db.pipelineRuns
    .filter((run) => run.teamId === id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 20);

  return {
    ...team,
    configs,
    positions,
    recentTrades,
    recentRuns,
    performance: computeTeamPerformance(id)
  };
}

export interface CreateTeamInput {
  name: string;
  avatar?: string;
  strategyPrompt: string;
  riskProfile: AgentTeam["riskProfile"];
  bankroll?: number;
}

export function createTeam(input: CreateTeamInput, userId = DEMO_USER_ID): AgentTeam {
  const db = store();
  const createdAt = nowIso();

  const team: AgentTeam = {
    id: uid(),
    userId,
    name: input.name,
    avatar: input.avatar?.slice(0, 2).toUpperCase() || input.name.slice(0, 2).toUpperCase(),
    strategyPrompt: input.strategyPrompt,
    riskProfile: input.riskProfile,
    bankroll: input.bankroll ?? 10000,
    initialBankroll: input.bankroll ?? 10000,
    isActive: true,
    createdAt,
    updatedAt: createdAt
  };

  db.agentTeams.push(team);

  db.activities.unshift({
    id: uid(),
    kind: "team_created",
    title: `${team.name} deployed`,
    description: `${team.riskProfile} risk profile with ${Math.round(team.bankroll)} bankroll.`,
    teamId: team.id,
    createdAt
  });

  return team;
}

export function updateTeam(
  id: string,
  patch: Partial<Pick<AgentTeam, "name" | "strategyPrompt" | "riskProfile" | "isActive">>
): AgentTeam | null {
  const db = store();
  const idx = db.agentTeams.findIndex((item) => item.id === id);
  if (idx < 0) {
    return null;
  }

  db.agentTeams[idx] = {
    ...db.agentTeams[idx],
    ...patch,
    updatedAt: nowIso()
  };

  return db.agentTeams[idx];
}

export function deleteTeam(id: string): boolean {
  const db = store();
  const initial = db.agentTeams.length;
  db.agentTeams = db.agentTeams.filter((team) => team.id !== id);
  db.agentConfigs = db.agentConfigs.filter((cfg) => cfg.teamId !== id);
  db.positions = db.positions.filter((position) => position.teamId !== id);
  db.trades = db.trades.filter((trade) => trade.teamId !== id);
  db.pipelineRuns = db.pipelineRuns.filter((run) => run.teamId !== id);
  return db.agentTeams.length !== initial;
}

export function listTrades(filters?: TradesFilters): Trade[] {
  const db = store();

  let trades = [...db.trades];
  if (filters?.teamId) {
    trades = trades.filter((trade) => trade.teamId === filters.teamId);
  }
  if (filters?.marketId) {
    trades = trades.filter((trade) => trade.marketId === filters.marketId);
  }

  trades.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return trades.slice(0, filters?.limit ?? 100);
}

export interface PlaceTradeInput {
  marketId: string;
  side: MarketSide;
  amount: number;
  teamId?: string;
  userId?: string;
  pipelineRunId?: string;
}

export function placeTrade(input: PlaceTradeInput): {
  trade: Trade;
  market: Market;
  position?: Position;
} {
  const db = store();
  const market = db.markets.find((item) => item.id === input.marketId);
  if (!market) {
    throw new Error("Market not found.");
  }

  if (market.status !== "open") {
    throw new Error("Market is not open for trading.");
  }

  const amount = round(Math.max(1, input.amount), 2);
  const execution = executeMarketTrade({
    side: input.side,
    amount,
    currentYesPrice: market.currentYesPrice,
    currentNoPrice: market.currentNoPrice
  });

  market.currentYesPrice = execution.yesPrice;
  market.currentNoPrice = execution.noPrice;
  market.volume = round(market.volume + amount, 2);

  const trade: Trade = {
    id: uid(),
    marketId: market.id,
    teamId: input.teamId,
    userId: input.userId,
    pipelineRunId: input.pipelineRunId,
    action: "buy",
    side: input.side,
    shares: execution.shares,
    price: execution.avgPrice,
    amount,
    createdAt: nowIso()
  };

  db.trades.unshift(trade);

  db.priceHistory.push({
    id: uid(),
    marketId: market.id,
    yesPrice: market.currentYesPrice,
    noPrice: market.currentNoPrice,
    volume: market.volume,
    recordedAt: nowIso()
  });

  let position: Position | undefined;
  if (input.teamId) {
    position = upsertPositionFromTrade(input.teamId, trade);
    const team = db.agentTeams.find((item) => item.id === input.teamId);
    if (team) {
      team.bankroll = round(Math.max(0, team.bankroll - amount), 2);
      team.updatedAt = nowIso();
    }
  }

  db.activities.unshift({
    id: uid(),
    kind: "trade",
    title: `Trade placed on ${market.question}`,
    description: `${input.side.toUpperCase()} ${execution.shares.toFixed(2)} shares at ${execution.avgPrice.toFixed(2)}c`,
    marketId: market.id,
    teamId: input.teamId,
    createdAt: nowIso()
  });

  return {
    trade,
    market,
    position
  };
}

function upsertPositionFromTrade(teamId: string, trade: Trade): Position {
  const db = store();
  const existing = db.positions.find(
    (position) =>
      position.teamId === teamId &&
      position.marketId === trade.marketId &&
      position.side === trade.side &&
      position.status === "open"
  );

  if (!existing) {
    const created: Position = {
      id: uid(),
      teamId,
      marketId: trade.marketId,
      side: trade.side,
      shares: trade.shares,
      avgPrice: trade.price,
      status: "open",
      realizedPnl: 0,
      createdAt: nowIso()
    };
    db.positions.push(created);
    return created;
  }

  const totalCost = existing.shares * existing.avgPrice + trade.shares * trade.price;
  const totalShares = existing.shares + trade.shares;
  existing.shares = round(totalShares, 4);
  existing.avgPrice = round(totalCost / Math.max(0.0001, totalShares), 2);

  return existing;
}

export function getPositionsForTeam(teamId: string): Position[] {
  return store().positions.filter((position) => position.teamId === teamId);
}

export function createPipelineRun(teamId: string, marketId: string, triggerType: "manual" | "scheduled" = "manual"): PipelineRun {
  const db = store();
  const run: PipelineRun = {
    id: uid(),
    teamId,
    marketId,
    status: "running",
    triggerType,
    totalTokensUsed: 0,
    totalCostEstimate: 0,
    totalLatencyMs: 0,
    startedAt: nowIso()
  };
  db.pipelineRuns.unshift(run);

  db.activities.unshift({
    id: uid(),
    kind: "pipeline_run",
    title: "Pipeline started",
    description: `Team ${teamId} started a run on market ${marketId}`,
    teamId,
    marketId,
    createdAt: nowIso()
  });

  return run;
}

export function updatePipelineRun(
  runId: string,
  patch: Partial<
    Pick<PipelineRun, "status" | "totalTokensUsed" | "totalCostEstimate" | "totalLatencyMs" | "errorMessage" | "completedAt">
  >
): PipelineRun | null {
  const db = store();
  const index = db.pipelineRuns.findIndex((run) => run.id === runId);
  if (index < 0) {
    return null;
  }
  db.pipelineRuns[index] = {
    ...db.pipelineRuns[index],
    ...patch
  };

  const updated = db.pipelineRuns[index];
  if (patch.status === "vetoed") {
    db.activities.unshift({
      id: uid(),
      kind: "risk_veto",
      title: "Risk manager veto",
      description: `Run ${runId} was vetoed before execution.`,
      teamId: updated.teamId,
      marketId: updated.marketId,
      createdAt: nowIso()
    });
  }

  return updated;
}

export function addAgentOutput(
  runId: string,
  payload: Omit<AgentOutput, "id" | "pipelineRunId" | "createdAt">
): AgentOutput {
  const db = store();
  const output: AgentOutput = {
    id: uid(),
    pipelineRunId: runId,
    createdAt: nowIso(),
    ...payload
  };
  db.agentOutputs.push(output);
  return output;
}

export function getPipelineRunDetail(runId: string): {
  run: PipelineRun;
  outputs: AgentOutput[];
} | null {
  const db = store();
  const run = db.pipelineRuns.find((item) => item.id === runId);
  if (!run) {
    return null;
  }
  const outputs = db.agentOutputs
    .filter((output) => output.pipelineRunId === runId)
    .sort((a, b) => a.stageOrder - b.stageOrder);

  return {
    run,
    outputs
  };
}

export function listPipelineRunsForTeam(teamId: string): PipelineRun[] {
  return store()
    .pipelineRuns.filter((run) => run.teamId === teamId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

function computeTeamPerformance(teamId: string): TeamPerformance {
  const db = store();
  const team = db.agentTeams.find((item) => item.id === teamId);
  if (!team) {
    return {
      teamId,
      totalPnl: 0,
      roiPct: 0,
      winRate: 0,
      brierScore: 0,
      riskAdjustedReturn: 0
    };
  }

  const teamTrades = db.trades.filter((trade) => trade.teamId === teamId);
  const closed = db.positions.filter((position) => position.teamId === teamId && position.status === "closed");
  const wins = closed.filter((position) => position.realizedPnl > 0).length;
  const winRate = closed.length > 0 ? wins / closed.length : 0;
  const realized = closed.reduce((sum, position) => sum + position.realizedPnl, 0);

  const unrealized = db.positions
    .filter((position) => position.teamId === teamId && position.status === "open")
    .reduce((sum, position) => {
      const market = db.markets.find((item) => item.id === position.marketId);
      if (!market) {
        return sum;
      }
      const markPrice = position.side === "yes" ? market.currentYesPrice : market.currentNoPrice;
      return sum + position.shares * (markPrice - position.avgPrice);
    }, 0);

  const totalPnl = round(realized + unrealized, 2);
  const roiPct = round(pct(totalPnl, team.initialBankroll), 2);

  const confidenceProxy = teamTrades.length > 0 ? Math.min(0.95, 0.45 + teamTrades.length * 0.01) : 0.5;

  return {
    teamId,
    totalPnl,
    roiPct,
    winRate: round(winRate * 100, 2),
    brierScore: round(1 - confidenceProxy, 3),
    riskAdjustedReturn: round(roiPct / Math.max(2, 8 + Math.sqrt(teamTrades.length || 1)), 3)
  };
}

export function getLeaderboard(): Array<{
  team: AgentTeam;
  performance: TeamPerformance;
}> {
  const db = store();
  return db.agentTeams
    .map((team) => ({
      team,
      performance: computeTeamPerformance(team.id)
    }))
    .sort((a, b) => b.performance.totalPnl - a.performance.totalPnl);
}

export function getPortfolioSummary(userId = DEMO_USER_ID): {
  totalBankroll: number;
  initialBankroll: number;
  totalPnl: number;
  roiPct: number;
  positions: Position[];
  equityCurve: Array<{ time: string; value: number }>;
  drawdownCurve: Array<{ time: string; value: number }>;
} {
  const db = store();
  const teams = db.agentTeams.filter((team) => team.userId === userId);
  const teamIds = new Set(teams.map((team) => team.id));

  const totalBankroll = round(teams.reduce((sum, team) => sum + team.bankroll, 0), 2);
  const initialBankroll = round(teams.reduce((sum, team) => sum + team.initialBankroll, 0), 2);
  const totalPnl = round(totalBankroll - initialBankroll, 2);

  const trades = db.trades
    .filter((trade) => trade.teamId && teamIds.has(trade.teamId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let running = initialBankroll;
  let peak = initialBankroll;

  const equityCurve = trades.map((trade) => {
    running -= trade.amount;
    peak = Math.max(peak, running);
    return { time: trade.createdAt, value: round(running, 2) };
  });

  const drawdownCurve = equityCurve.map((point) => {
    peak = Math.max(peak, point.value);
    return {
      time: point.time,
      value: round(point.value - peak, 2)
    };
  });

  return {
    totalBankroll,
    initialBankroll,
    totalPnl,
    roiPct: round(pct(totalPnl, initialBankroll), 2),
    positions: db.positions.filter((position) => teamIds.has(position.teamId)),
    equityCurve,
    drawdownCurve
  };
}

export function getActivity(limit = 40): ActivityItem[] {
  return store()
    .activities.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getAgentConfigs(teamId: string): AgentConfig[] {
  return store().agentConfigs.filter((cfg) => cfg.teamId === teamId);
}

export function upsertAgentConfig(teamId: string, role: AgentConfig["agentRole"], config: Partial<AgentConfig>): AgentConfig {
  const db = store();
  const idx = db.agentConfigs.findIndex((item) => item.teamId === teamId && item.agentRole === role);

  if (idx < 0) {
    const newConfig: AgentConfig = {
      id: uid(),
      teamId,
      agentRole: role,
      config: config.config ?? {},
      modelOverride: config.modelOverride,
      isActive: config.isActive ?? true
    };
    db.agentConfigs.push(newConfig);
    return newConfig;
  }

  db.agentConfigs[idx] = {
    ...db.agentConfigs[idx],
    ...config,
    config: {
      ...db.agentConfigs[idx].config,
      ...(config.config ?? {})
    }
  };

  return db.agentConfigs[idx];
}

export function pickBestMarketForTeam(teamId: string): Market | null {
  const db = store();
  const team = db.agentTeams.find((item) => item.id === teamId);
  if (!team) {
    return null;
  }

  const open = db.markets.filter((market) => market.status === "open");
  if (open.length === 0) {
    return null;
  }

  const profile = getRiskProfile(team.riskProfile);
  const horizonBiasDays = team.riskProfile === "conservative" ? 180 : 365;

  return open
    .map((market) => {
      const daysToResolution =
        (new Date(market.resolutionDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000);
      const horizonPenalty = Math.max(0, daysToResolution - horizonBiasDays) * 0.1;
      const edgeProxy = Math.abs(50 - market.currentYesPrice);
      const liquidityBonus = market.volume / 10000;
      const score = edgeProxy + liquidityBonus - horizonPenalty + profile.maxSingleBetPct;
      return {
        market,
        score
      };
    })
    .sort((a, b) => b.score - a.score)[0]?.market;
}

export function listMarketCategories(): MarketCategory[] {
  const categories = new Set(store().markets.map((market) => market.category));
  return Array.from(categories);
}
