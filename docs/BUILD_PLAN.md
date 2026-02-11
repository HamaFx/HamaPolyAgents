# Build Plan: AgentBets — Multi-Agent AI Prediction Market Platform

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, API routes, server components |
| Language | TypeScript + Zod | Type safety, structured LLM output validation |
| Styling | Tailwind CSS + shadcn/ui | Rapid dark-theme trading UI |
| Database | Supabase (PostgreSQL) | Real-time subscriptions, auth, instant API |
| Auth | Supabase Auth | Session management, RLS-ready |
| AI/LLM | OpenAI API (GPT-4o + GPT-4o-mini) | Multi-model strategy per agent role |
| Agent Orchestration | Custom pipeline engine (TypeScript) | Full control, no heavy framework overhead |
| Validation | Zod | Validate every LLM structured output |
| Real-time | Supabase Realtime | WebSocket subscriptions for live feeds |
| Charts | Recharts | Odds charts, equity curves, PnL |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## 2. Project Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (dark theme, providers)
│   ├── page.tsx                            # Homepage — market dashboard + activity
│   ├── markets/
│   │   └── [id]/
│   │       └── page.tsx                    # Market detail page
│   ├── teams/
│   │   ├── page.tsx                        # My agent teams list
│   │   ├── new/
│   │   │   └── page.tsx                    # Create team wizard
│   │   └── [id]/
│   │       ├── page.tsx                    # Team detail / performance
│   │       └── runs/
│   │           └── [runId]/
│   │               └── page.tsx            # Pipeline run detail (decision chain)
│   ├── leaderboard/
│   │   └── page.tsx                        # Global leaderboard
│   ├── portfolio/
│   │   └── page.tsx                        # User portfolio overview
│   └── api/
│       ├── markets/
│       │   ├── route.ts                    # GET: list markets
│       │   └── [id]/
│       │       └── route.ts                # GET: market detail
│       ├── teams/
│       │   ├── route.ts                    # GET/POST: list/create teams
│       │   └── [id]/
│       │       ├── route.ts                # GET/PUT/DELETE: team CRUD
│       │       └── run/
│       │           └── route.ts            # POST: trigger full pipeline
│       ├── trades/
│       │   └── route.ts                    # GET/POST: trades
│       ├── pipeline/
│       │   └── [runId]/
│       │       └── route.ts                # GET: pipeline run detail
│       └── ai/
│           ├── preview/
│           │   └── route.ts                # POST: preview pipeline on sample market
│           └── agents/
│               ├── researcher/
│               │   └── route.ts            # POST: run researcher agent standalone
│               ├── analyst/
│               │   └── route.ts            # POST: run analyst agent standalone
│               ├── risk-manager/
│               │   └── route.ts            # POST: run risk manager standalone
│               └── executor/
│                   └── route.ts            # POST: run executor standalone
├── components/
│   ├── layout/
│   │   ├── header.tsx                      # Top nav bar
│   │   ├── sidebar.tsx                     # Side navigation
│   │   └── mobile-nav.tsx                  # Mobile navigation
│   ├── markets/
│   │   ├── market-card.tsx                 # Market card for grid
│   │   ├── market-grid.tsx                 # Market grid/list view
│   │   ├── market-detail.tsx               # Market detail content
│   │   ├── odds-chart.tsx                  # Price history chart
│   │   ├── trade-form.tsx                  # Manual bet placement
│   │   └── category-filter.tsx             # Category filter pills
│   ├── teams/
│   │   ├── team-card.tsx                   # Team card
│   │   ├── team-form.tsx                   # Create/edit team form
│   │   ├── team-wizard.tsx                 # Multi-step team creation wizard
│   │   ├── agent-config-panel.tsx          # Per-agent configuration panel
│   │   └── team-status-badge.tsx           # Active/paused indicator
│   ├── pipeline/
│   │   ├── pipeline-timeline.tsx           # Visual timeline of pipeline stages
│   │   ├── agent-output-card.tsx           # Display one agent's output
│   │   ├── debate-viewer.tsx               # Bull vs Bear debate display
│   │   ├── risk-assessment-card.tsx        # Risk manager decision display
│   │   ├── decision-chain.tsx              # Full decision chain viewer
│   │   └── pipeline-status.tsx             # Pipeline running/complete indicator
│   ├── portfolio/
│   │   ├── positions-table.tsx             # Open/closed positions
│   │   ├── equity-chart.tsx                # Equity curve
│   │   ├── drawdown-chart.tsx              # Drawdown visualization
│   │   └── pnl-summary.tsx                 # PnL summary cards
│   ├── leaderboard/
│   │   └── leaderboard-table.tsx           # Ranked teams table
│   └── shared/
│       ├── activity-feed.tsx               # Real-time activity feed
│       ├── stat-card.tsx                   # Metric display card
│       ├── confidence-bar.tsx              # Confidence score visualization
│       └── loading.tsx                     # Loading skeletons
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Supabase browser client
│   │   ├── server.ts                       # Supabase server client
│   │   └── types.ts                        # Generated DB types
│   ├── ai/
│   │   ├── pipeline/
│   │   │   ├── orchestrator.ts             # ★ Pipeline orchestrator (the director)
│   │   │   ├── state.ts                    # Pipeline state definition (Zod schemas)
│   │   │   ├── runner.ts                   # Pipeline execution engine
│   │   │   └── constants.ts                # Timeouts, retry config, model mappings
│   │   ├── agents/
│   │   │   ├── researcher.ts               # ★ Researcher agent
│   │   │   ├── analyst.ts                  # ★ Analyst agent (with bull/bear debate)
│   │   │   ├── risk-manager.ts             # ★ Risk manager agent
│   │   │   ├── executor.ts                 # ★ Executor agent
│   │   │   └── base-agent.ts              # Base agent class (shared logic)
│   │   ├── prompts/
│   │   │   ├── system.ts                   # System prompts per role
│   │   │   ├── researcher-prompt.ts        # Researcher-specific prompt builder
│   │   │   ├── analyst-prompt.ts           # Analyst-specific prompt builder
│   │   │   ├── bull-bear-prompt.ts         # Adversarial debate prompts
│   │   │   ├── risk-manager-prompt.ts      # Risk manager prompt builder
│   │   │   ├── executor-prompt.ts          # Executor prompt builder
│   │   │   └── semantic-anchor.ts          # Global context injected into all agents
│   │   ├── schemas/
│   │   │   ├── researcher-output.ts        # Zod schema for researcher output
│   │   │   ├── analyst-output.ts           # Zod schema for analyst output
│   │   │   ├── risk-manager-output.ts      # Zod schema for risk manager output
│   │   │   └── executor-output.ts          # Zod schema for executor output
│   │   └── llm.ts                          # OpenAI client + call helper with retries
│   ├── market/
│   │   ├── engine.ts                       # Market simulation engine
│   │   ├── pricing.ts                      # AMM pricing logic
│   │   └── seed.ts                         # Seed data for demo markets
│   ├── risk/
│   │   ├── profiles.ts                     # Risk profile parameters
│   │   ├── position-sizer.ts              # Position sizing (Kelly criterion variant)
│   │   └── portfolio-checks.ts            # Exposure, correlation, drawdown checks
│   └── utils.ts                            # Shared utilities
└── types/
    └── index.ts                            # Shared TypeScript types
```

---

## 3. Database Schema

```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prediction Markets
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  resolution_date TIMESTAMPTZ NOT NULL,
  current_yes_price DECIMAL(5,2) DEFAULT 50.00,
  current_no_price DECIMAL(5,2) DEFAULT 50.00,
  volume DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'open',
  resolved_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Teams
CREATE TABLE agent_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  strategy_prompt TEXT NOT NULL,
  risk_profile TEXT DEFAULT 'moderate',
  bankroll DECIMAL(12,2) DEFAULT 10000.00,
  initial_bankroll DECIMAL(12,2) DEFAULT 10000.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Per-agent configuration overrides within a team
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE NOT NULL,
  agent_role TEXT NOT NULL, -- orchestrator, researcher, analyst, risk_manager, executor
  config JSONB DEFAULT '{}',
  model_override TEXT, -- e.g. 'gpt-4o' to override default
  is_active BOOLEAN DEFAULT true,
  UNIQUE(team_id, agent_role)
);

-- Pipeline Runs (one full decision cycle)
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE NOT NULL,
  market_id UUID REFERENCES markets(id) NOT NULL,
  status TEXT DEFAULT 'running', -- running, completed, failed, timeout, vetoed
  trigger_type TEXT DEFAULT 'manual', -- manual, scheduled
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_estimate DECIMAL(8,4) DEFAULT 0,
  total_latency_ms INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Agent Outputs (per-agent output within a pipeline run)
CREATE TABLE agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id UUID REFERENCES pipeline_runs(id) ON DELETE CASCADE NOT NULL,
  agent_role TEXT NOT NULL,
  stage_order INTEGER NOT NULL, -- 1=researcher, 2=analyst, 3=risk_manager, 4=executor
  input_data JSONB,
  output_data JSONB,
  reasoning TEXT,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed, skipped
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Positions (team holdings in markets)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE NOT NULL,
  market_id UUID REFERENCES markets(id) NOT NULL,
  side TEXT NOT NULL,
  shares DECIMAL(12,4) DEFAULT 0,
  avg_price DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'open',
  realized_pnl DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, market_id, side)
);

-- Trade history
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES agent_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  market_id UUID REFERENCES markets(id) NOT NULL,
  pipeline_run_id UUID REFERENCES pipeline_runs(id),
  action TEXT NOT NULL,
  side TEXT NOT NULL,
  shares DECIMAL(12,4) NOT NULL,
  price DECIMAL(5,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Market price history (for charts)
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) NOT NULL,
  yes_price DECIMAL(5,2) NOT NULL,
  no_price DECIMAL(5,2) NOT NULL,
  volume DECIMAL(12,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Multi-Agent System — Deep Technical Design

### 4.1 Pipeline State Machine

```
                    ┌──────────┐
                    │  CREATED │
                    └────┬─────┘
                         │ start()
                    ┌────▼─────┐
                    │ RESEARCH │ ── timeout/fail ──► FAILED
                    └────┬─────┘
                         │ research complete
                    ┌────▼─────┐
                    │ ANALYSIS │ ── timeout/fail ──► FAILED
                    │ (Bull)   │
                    │ (Bear)   │
                    │ (Synth)  │
                    └────┬─────┘
                         │ analysis complete
                    ┌────▼──────┐
                    │ RISK_EVAL │ ── timeout/fail ──► FAILED
                    └────┬──────┘
                         │
                    ┌────┴────┐
                    │         │
              APPROVED    VETOED ──► COMPLETED (no trade)
                    │
              ┌─────▼─────┐
              │ EXECUTION  │ ── fail ──► FAILED
              └─────┬──────┘
                    │
              ┌─────▼──────┐
              │ COMPLETED   │
              └─────────────┘
```

### 4.2 Orchestrator (`lib/ai/pipeline/orchestrator.ts`)

The orchestrator is NOT an LLM call — it's a deterministic TypeScript state machine that manages the pipeline:

```typescript
// Conceptual flow
class PipelineOrchestrator {
  async run(teamId: string, marketId: string): Promise<PipelineResult> {
    const run = await createPipelineRun(teamId, marketId);
    const context = await buildSemanticAnchor(teamId, marketId);
    
    // Stage 1: Research
    const research = await withTimeout(
      researcher.execute(context),
      TIMEOUTS.RESEARCHER // 15s
    );
    await saveAgentOutput(run.id, 'researcher', research);
    
    // Stage 2: Analysis (includes bull/bear debate)
    const analysis = await withTimeout(
      analyst.execute(context, research),
      TIMEOUTS.ANALYST // 20s — needs time for debate
    );
    await saveAgentOutput(run.id, 'analyst', analysis);
    
    // Stage 3: Risk Assessment
    const risk = await withTimeout(
      riskManager.execute(context, analysis),
      TIMEOUTS.RISK_MANAGER // 10s
    );
    await saveAgentOutput(run.id, 'risk_manager', risk);
    
    // Stage 4: Execute (only if approved)
    if (risk.decision === 'approve' || risk.decision === 'reduce') {
      const execution = await executor.execute(context, analysis, risk);
      await saveAgentOutput(run.id, 'executor', execution);
    }
    
    await completePipelineRun(run.id);
    return buildResult(run.id);
  }
}
```

### 4.3 Semantic Anchor (Global Context)

Every agent receives this context to prevent drift:

```typescript
interface SemanticAnchor {
  // Team identity
  teamName: string;
  teamStrategy: string;        // User's natural language strategy
  riskProfile: RiskProfile;
  
  // Portfolio state
  currentBankroll: number;
  initialBankroll: number;
  pnlPercent: number;
  openPositions: Position[];
  categoryExposure: Record<string, number>; // category → % of bankroll
  
  // Market info
  market: Market;
  recentTrades: Trade[];       // Last 10 trades in this market
  
  // Risk parameters (from risk profile)
  maxBetPercent: number;
  maxPositionPercent: number;
  maxCategoryExposure: number;
  drawdownPauseThreshold: number;
  minConfidence: number;
}
```

### 4.4 Agent Implementations

#### Researcher Agent (`lib/ai/agents/researcher.ts`)

**Model:** GPT-4o-mini (fast, cheap — extraction task)

**Input:** Semantic anchor (market data, team strategy)

**Process:**
1. Analyze market question and resolution criteria
2. Identify key factors that would influence the outcome
3. Assess current odds vs implied probability
4. Look at market volume and trading patterns
5. Identify related/correlated markets in the system

**Output Schema (Zod):**
```typescript
const ResearcherOutput = z.object({
  market_summary: z.string(),
  key_factors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['bullish', 'bearish', 'neutral']),
    importance: z.number().min(0).max(1),
  })),
  odds_assessment: z.object({
    current_implied_prob: z.number(),
    researcher_estimated_prob: z.number(),
    edge: z.number(), // difference between estimated and implied
  }),
  data_confidence: z.number().min(0).max(1),
  related_markets: z.array(z.string()),
});
```

#### Analyst Agent (`lib/ai/agents/analyst.ts`)

**Model:** GPT-4o (needs strong reasoning for debate)

**Process (3 LLM calls):**

1. **Bull Call:** Given the research, argue the strongest case FOR this opportunity
2. **Bear Call:** Given the research AND the bull case, argue the strongest case AGAINST
3. **Synthesis Call:** Given bull + bear arguments, produce a final signal

**Output Schema:**
```typescript
const AnalystOutput = z.object({
  bull_case: z.object({
    argument: z.string(),
    confidence: z.number().min(0).max(1),
    key_points: z.array(z.string()),
  }),
  bear_case: z.object({
    argument: z.string(),
    confidence: z.number().min(0).max(1),
    key_points: z.array(z.string()),
  }),
  synthesis: z.object({
    signal: z.enum(['strong_buy_yes', 'buy_yes', 'hold', 'buy_no', 'strong_buy_no']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    suggested_size_pct: z.number().min(0).max(100), // % of max allowed bet
  }),
});
```

#### Risk Manager Agent (`lib/ai/agents/risk-manager.ts`)

**Model:** GPT-4o (critical decision — needs strong reasoning)

**Input:** Semantic anchor + analyst output + full portfolio state

**Process:**
1. LLM evaluates the trade in context of the full portfolio
2. Deterministic checks layer on top:
   - Bankroll sufficient?
   - Position sizing within limits?
   - Category exposure within limits?
   - Drawdown threshold breached?
   - Min confidence met?

**Output Schema:**
```typescript
const RiskManagerOutput = z.object({
  decision: z.enum(['approve', 'reduce', 'veto']),
  approved_amount: z.number().min(0),
  approved_size_pct: z.number().min(0).max(100),
  reasoning: z.string(),
  risk_flags: z.array(z.object({
    flag: z.string(),
    severity: z.enum(['info', 'warning', 'critical']),
    description: z.string(),
  })),
  portfolio_health: z.object({
    total_exposure_pct: z.number(),
    drawdown_pct: z.number(),
    category_concentrations: z.record(z.number()),
  }),
});
```

#### Executor Agent (`lib/ai/agents/executor.ts`)

**Model:** None (deterministic) — no LLM call needed

**Process:**
1. Calculate shares from approved amount and current price
2. Execute trade against the AMM (update market prices)
3. Create/update position record
4. Update team bankroll
5. Record trade in history
6. Record price history point

**Output Schema:**
```typescript
const ExecutorOutput = z.object({
  executed: z.boolean(),
  trade: z.object({
    action: z.enum(['buy', 'sell']),
    side: z.enum(['yes', 'no']),
    shares: z.number(),
    price: z.number(),
    amount: z.number(),
    price_impact: z.number(), // slippage from AMM
  }).optional(),
  new_bankroll: z.number(),
  new_position: z.object({
    side: z.string(),
    shares: z.number(),
    avg_price: z.number(),
  }).optional(),
  skip_reason: z.string().optional(),
});
```

### 4.5 Model Selection Per Agent Role

| Agent Role | Default Model | Reasoning |
|---|---|---|
| Researcher | `gpt-4o-mini` | Extraction/summarization — fast & cheap |
| Analyst (Bull) | `gpt-4o` | Needs strong argumentation |
| Analyst (Bear) | `gpt-4o` | Needs strong counter-argumentation |
| Analyst (Synthesis) | `gpt-4o` | Critical synthesis decision |
| Risk Manager | `gpt-4o` | Portfolio-level reasoning |
| Executor | No LLM | Deterministic execution |

**Estimated tokens per full pipeline run:** ~4,000-6,000 tokens
**Estimated cost per run:** ~$0.02-0.04

### 4.6 Error Handling & Resilience

```
Agent Failure Strategy:
├── Timeout (agent exceeds time limit)
│   ├── Retry once with shorter context
│   └── If still fails → mark pipeline as failed with explanation
├── Invalid Output (Zod validation fails)
│   ├── Retry with "fix your JSON" prompt (1x)
│   └── If still fails → mark pipeline as failed
├── LLM API Error (rate limit, 500, etc)
│   ├── Exponential backoff: 1s → 2s → 4s (max 3 retries)
│   └── If exhausted → mark pipeline as failed
└── Risk Manager Veto
    └── Normal flow — log reasoning, mark as "vetoed" (not "failed")
```

---

## 5. API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/markets` | List all markets (filters: category, status, sort) |
| GET | `/api/markets/[id]` | Market detail + recent trades + price history |
| POST | `/api/trades` | Place a manual trade |
| GET | `/api/trades` | List trades (filters: market_id, team_id) |
| GET | `/api/teams` | List user's agent teams |
| POST | `/api/teams` | Create a new agent team |
| GET | `/api/teams/[id]` | Team detail + stats + recent runs |
| PUT | `/api/teams/[id]` | Update team config |
| DELETE | `/api/teams/[id]` | Delete team |
| POST | `/api/teams/[id]/run` | Trigger full pipeline on best market |
| GET | `/api/pipeline/[runId]` | Full pipeline run detail (all agent outputs) |
| POST | `/api/ai/preview` | Preview pipeline on a market (no execution) |
| POST | `/api/ai/agents/researcher` | Run researcher standalone |
| POST | `/api/ai/agents/analyst` | Run analyst standalone |
| POST | `/api/ai/agents/risk-manager` | Run risk manager standalone |

---

## 6. Risk Management System (`lib/risk/`)

### 6.1 Risk Profiles (`profiles.ts`)

```typescript
const RISK_PROFILES = {
  conservative: {
    maxSingleBetPct: 3,
    maxPositionPct: 10,
    maxCategoryExposurePct: 25,
    drawdownPauseThresholdPct: 8,
    minConfidence: 0.75,
    maxConcurrentPositions: 5,
    debateRounds: 3,
  },
  moderate: {
    maxSingleBetPct: 8,
    maxPositionPct: 20,
    maxCategoryExposurePct: 40,
    drawdownPauseThresholdPct: 15,
    minConfidence: 0.60,
    maxConcurrentPositions: 10,
    debateRounds: 2,
  },
  aggressive: {
    maxSingleBetPct: 15,
    maxPositionPct: 35,
    maxCategoryExposurePct: 60,
    drawdownPauseThresholdPct: 25,
    minConfidence: 0.45,
    maxConcurrentPositions: 20,
    debateRounds: 1,
  },
};
```

### 6.2 Position Sizing (`position-sizer.ts`)

Modified Kelly Criterion for conservative sizing:

```
kelly_fraction = (edge * confidence) / odds
half_kelly = kelly_fraction / 2     # Half-Kelly for safety
actual_size = min(half_kelly * bankroll, max_single_bet)
```

### 6.3 Portfolio Checks (`portfolio-checks.ts`)

Before any trade, check:
1. **Bankroll check**: `amount <= available_bankroll`
2. **Position limit**: `new_position_value <= maxPositionPct * bankroll`
3. **Category exposure**: `category_total <= maxCategoryExposurePct * bankroll`
4. **Concurrent positions**: `open_positions_count < maxConcurrentPositions`
5. **Drawdown check**: `current_drawdown < drawdownPauseThresholdPct`

---

## 7. Market Simulation Engine (`lib/market/`)

### 7.1 AMM Pricing (`pricing.ts`)

Simplified Constant Product Market Maker:

```
# Initial state: each market has virtual liquidity
yes_pool = 1000, no_pool = 1000

# Price = pool_opposite / (pool_yes + pool_no)
yes_price = no_pool / (yes_pool + no_pool) * 100
no_price = yes_pool / (yes_pool + no_pool) * 100

# Buy YES: send amount, receive shares
shares = yes_pool - (yes_pool * no_pool) / (no_pool + amount)
# Update pools
yes_pool -= shares
no_pool += amount

# Price impact = new_price - old_price
```

### 7.2 Market Resolution

When a market resolves:
1. Set `resolved_outcome` (yes/no)
2. Close all open positions
3. Calculate PnL for each position:
   - If outcome matches position side: `pnl = shares * 100 - (shares * avg_price)`
   - If outcome doesn't match: `pnl = -(shares * avg_price)`
4. Update team bankrolls
5. Mark positions as closed

---

## 8. UI Design System

### 8.1 Theme

Dark trading terminal aesthetic:

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0e17` | Page background |
| `--bg-card` | `#111827` | Card background |
| `--bg-card-hover` | `#1a1f2e` | Card hover state |
| `--bg-input` | `#1f2937` | Input backgrounds |
| `--text-primary` | `#f9fafb` | Primary text |
| `--text-secondary` | `#9ca3af` | Secondary text |
| `--text-muted` | `#6b7280` | Muted text |
| `--accent-green` | `#10b981` | YES / Profit / Approve |
| `--accent-red` | `#ef4444` | NO / Loss / Veto |
| `--accent-blue` | `#6366f1` | Accent / Links |
| `--accent-purple` | `#8b5cf6` | AI / Agent highlights |
| `--accent-yellow` | `#f59e0b` | Warnings / Reduce |
| `--accent-cyan` | `#06b6d4` | Research / Data |
| `--border` | `#1f2937` | Borders |

### 8.2 Key UI Patterns

- **Pipeline Timeline**: Vertical timeline showing each agent's contribution with expand/collapse
- **Debate Viewer**: Side-by-side bull vs bear cards with connecting synthesis
- **Confidence Bars**: Horizontal gradient bars (red → yellow → green) for confidence scores
- **Risk Flags**: Color-coded badges (info=blue, warning=yellow, critical=red)
- **Live Indicators**: Pulsing dots for active pipelines, real-time updating numbers

---

## 9. Seed Data

### 9.1 Demo Markets (12 markets)

1. **Politics:** "Will the US pass new AI regulation before July 2026?" — YES: 62%
2. **Politics:** "Will there be a government shutdown in Q1 2026?" — YES: 35%
3. **Crypto:** "Will Bitcoin exceed $150,000 by end of 2026?" — YES: 45%
4. **Crypto:** "Will Ethereum flip Bitcoin in market cap by 2027?" — YES: 12%
5. **Tech:** "Will Apple release AR glasses in 2026?" — YES: 58%
6. **Tech:** "Will OpenAI release GPT-5 before June 2026?" — YES: 73%
7. **Sports:** "Will Real Madrid win the Champions League 2026?" — YES: 28%
8. **Sports:** "Will an AI system beat a professional esports team in 2026?" — YES: 22%
9. **World:** "Will global temperatures set a new record in 2026?" — YES: 81%
10. **Science:** "Will a crewed Mars mission launch before 2030?" — YES: 18%
11. **Entertainment:** "Will a streaming-only film win Best Picture at Oscars 2027?" — YES: 41%
12. **Crypto:** "Will a country adopt Bitcoin as legal tender in 2026?" — YES: 33%

Each market has 20-50 price history points simulating realistic price movement.

### 9.2 Demo Agent Team

Pre-created "Alpha Team" with moderate risk profile and strategy:
"Balanced approach. Look for markets where the odds seem mispriced. Prefer markets with clear resolution criteria. Avoid markets resolving more than 1 year out."

---

## 10. Implementation Phases

### Phase 1: Foundation
1. Database setup (Supabase tables + seed data)
2. TypeScript types + Zod schemas
3. Supabase client setup
4. AMM pricing engine
5. App shell (layout, header, sidebar, dark theme)

### Phase 2: Markets
6. Market dashboard (grid, filters, search)
7. Market detail page (info, odds chart, trades)
8. Manual trading (trade form + API)

### Phase 3: Agent Teams
9. Team builder (wizard, strategy prompt, risk profile)
10. Team list + team detail pages

### Phase 4: Multi-Agent Pipeline (Core)
11. Base agent class + LLM helper
12. Researcher agent implementation
13. Analyst agent (bull/bear/synthesis)
14. Risk manager agent + deterministic checks
15. Executor agent (deterministic)
16. Orchestrator + pipeline runner
17. Pipeline run API + trigger endpoint

### Phase 5: Decision Viewer
18. Pipeline timeline component
19. Debate viewer (bull vs bear)
20. Decision chain page
21. Risk assessment display

### Phase 6: Portfolio & Analytics
22. Portfolio page (positions, PnL, equity curve)
23. Team performance dashboard

### Phase 7: Social & Real-time
24. Leaderboard
25. Activity feed (Supabase Realtime)
26. Polish, animations, responsive

---

## 11. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```
