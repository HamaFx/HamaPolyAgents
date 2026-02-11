# Product Requirements Document: AgentBets

## AI-Powered Prediction Market Trading Platform with Multi-Agent Intelligence

---

## 1. Vision & Overview

**Product Name:** AgentBets

**Vision:** A web platform where users deploy teams of specialized AI agents that collaboratively analyze information, debate strategies, manage risk, and autonomously place bets on prediction markets. Unlike single-agent systems, AgentBets uses an "Investment Committee" architecture — multiple AI agents with distinct roles (researcher, analyst, risk manager, executor) coordinated by an orchestrator agent that manages the entire decision pipeline.

**Target Users:**
- AI/ML enthusiasts experimenting with multi-agent LLM systems
- Prediction market power users (Polymarket, Manifold Markets)
- Algorithmic/quantitative trading hobbyists
- Developers exploring agent orchestration patterns

---

## 2. Core Concepts

### 2.1 Prediction Markets
- Binary outcome markets (YES/NO) with prices from 0-100 representing probability
- Categories: Politics, Sports, Crypto, Tech, World Events, Science, Entertainment
- States: `open` | `closed` | `resolved`
- Simulated paper trading — no real money
- Simple Constant Product AMM for price discovery

### 2.2 Multi-Agent Architecture ("Investment Committee")

Each user deploys an **Agent Team** — a coordinated group of 5 specialized AI agents that work together through a structured decision pipeline:

#### Agent Roles

| Role | Name | Responsibility | Analogy |
|---|---|---|---|
| **Orchestrator** | The Director | Manages the pipeline, routes tasks, aggregates results, enforces timeouts, breaks deadlocks | CEO |
| **Researcher** | The Scout | Searches for and fetches relevant data — news, market context, historical patterns, related markets | Research Analyst |
| **Analyst** | The Strategist | Analyzes data from the Researcher, applies technical/fundamental analysis, generates trade signals with confidence scores | Quant Analyst |
| **Risk Manager** | The Guardian | Evaluates portfolio exposure, correlation, volatility, position sizing, enforces risk limits, can veto trades | CFO / Risk Officer |
| **Executor** | The Trader | Executes approved trades, manages order timing, tracks fills, updates positions | Floor Trader |

#### Decision Pipeline Flow

```
Orchestrator receives trigger (manual or scheduled)
    │
    ├──► Researcher: Fetch market data, news, sentiment, related markets
    │       │
    │       ▼
    ├──► Analyst: Analyze researcher output + market state
    │    ├── Bull Case Agent (argues FOR the position)
    │    ├── Bear Case Agent (argues AGAINST the position)
    │    └── Synthesis: Reconcile into signal + confidence
    │       │
    │       ▼
    ├──► Risk Manager: Evaluate signal against portfolio constraints
    │    ├── Position sizing (Kelly criterion variant)
    │    ├── Correlation check (don't overexpose to one category)
    │    ├── Drawdown check (pause if portfolio down > threshold)
    │    └── APPROVE / REJECT / REDUCE
    │       │
    │       ▼
    └──► Executor: Place trade if approved
         ├── Calculate optimal entry
         ├── Execute trade
         ├── Update positions & bankroll
         └── Log full decision chain
```

### 2.3 Agent Team Customization

Users customize their team through:

- **Team Strategy** (natural language): High-level investment thesis applied across all agents
  - "Focus exclusively on crypto and tech markets. Be contrarian when odds are extreme."
  - "Conservative value approach. Only bet when confidence > 80%."
- **Risk Profile**: Conservative / Moderate / Aggressive (affects all risk parameters)
- **Individual Agent Tuning**: Override default behavior per agent
  - Researcher: Data sources to prioritize, search depth
  - Analyst: Analysis style (technical vs fundamental vs sentiment)
  - Risk Manager: Max exposure, drawdown limits, correlation limits
- **Starting Bankroll**: Virtual money to trade with (default $10,000)

### 2.4 Adversarial Analysis (Bull vs Bear Debate)

The Analyst stage uses **adversarial prompting** — two sub-agents argue opposing sides:

1. **Bull Agent**: Finds all reasons to take the position (buy YES or buy NO)
2. **Bear Agent**: Finds all reasons NOT to take the position, pokes holes in Bull's thesis
3. **Synthesis**: The Analyst reconciles both arguments into a final signal

This prevents confirmation bias and produces more robust decisions. The full debate transcript is logged and visible to users.

### 2.5 Paper Trading
- All trading is simulated (no real money)
- Each agent team starts with a configurable virtual bankroll (default: $10,000)
- Positions are tracked; PnL calculated when markets resolve
- Full audit trail of every decision with reasoning

---

## 3. Features

### 3.1 MVP Features

#### F1: Market Dashboard
- Grid/list of all active prediction markets
- Filter by category, sort by volume/date/odds/trending
- Market cards: question, YES/NO odds, volume, resolution date, category badge, agent activity indicator
- Search across markets
- Trending section showing markets with most agent activity

#### F2: Market Detail Page
- Full market info: question, description, resolution criteria, date
- Live odds chart (price history over time via Recharts)
- Order book / recent trades
- Agent positions in this market (which teams are betting what)
- Manual bet placement (users can also bet directly)
- AI analysis panel — see what agents are thinking about this market

#### F3: Agent Team Builder
- Create/edit an agent team:
  - **Team name & avatar**
  - **Team strategy prompt** (natural language investment thesis)
  - **Risk profile selector**: Conservative / Moderate / Aggressive
  - **Starting bankroll**
  - **Advanced: Per-agent configuration**
    - Researcher: search depth (shallow/deep), source priority
    - Analyst: analysis style (technical/fundamental/sentiment/balanced)
    - Risk Manager: custom limits (max bet %, max exposure %, drawdown pause threshold)
    - Executor: trade timing (immediate / wait for better price)
  - **Enable/disable toggle** per agent and for the whole team
- **Preview mode**: Run the full pipeline on a sample market before deploying
  - See each agent's output step by step
  - Review the bull/bear debate
  - See the final decision and reasoning

#### F4: Multi-Agent Execution Engine (Core System)
- **Pipeline orchestration**: Orchestrator manages the full decision flow
- **Parallel execution**: Multiple markets can be analyzed simultaneously
- **Structured outputs**: Each agent returns typed JSON (validated with Zod)
- **State management**: Full pipeline state tracked per execution run
- **Timeout handling**: Max 30s per agent, 2min per full pipeline
- **Retry logic**: Failed agent calls retry up to 2x with exponential backoff
- **Decision logging**: Every agent output, the full debate, and final decision logged
- **Cost tracking**: Token usage tracked per run (for monitoring LLM costs)

#### F5: Agent Decision Viewer
- For each trade, see the full decision chain:
  1. What the Researcher found (data, news, context)
  2. Bull case arguments
  3. Bear case arguments
  4. Analyst synthesis + signal + confidence
  5. Risk Manager assessment (approved/rejected/reduced + reasoning)
  6. Executor action (trade details or skip reasoning)
- Timeline visualization of the decision pipeline
- Confidence and risk scores at each stage

#### F6: Portfolio & Performance
- Per-team portfolio: open positions, realized PnL, unrealized PnL, win rate
- Aggregate portfolio across all user's teams
- Performance charts (equity curve, PnL over time, drawdown chart)
- Per-agent performance metrics:
  - Researcher: data quality score (did analysis based on its data lead to wins?)
  - Analyst: signal accuracy (confidence vs actual outcomes)
  - Risk Manager: saves (how many vetoed trades would have lost?)
  - Executor: execution quality

#### F7: Leaderboard
- Global ranking of all agent teams by:
  - Total PnL
  - Win rate
  - ROI %
  - Brier score (prediction accuracy)
  - Risk-adjusted return (Sharpe-like ratio)
- Filterable by time period (24h, 7d, 30d, all-time)
- Filterable by risk profile
- Click into any team to see their strategy and recent decisions

#### F8: Real-Time Activity Feed
- Global feed showing:
  - Agent team bets placed (with reasoning preview)
  - Markets resolved (winners/losers)
  - Notable moves (large bets, big wins/losses, streaks)
  - Risk manager vetoes (interesting to see what was blocked)
- Per-team activity log
- Per-market activity log
- WebSocket-powered real-time updates

---

## 4. User Flows

### Flow 1: First-Time User
1. Land on homepage → see featured markets, top agent teams, live activity feed
2. Browse markets, explore the platform
3. Create an agent team (guided wizard)
   - Name the team, write a strategy, pick risk profile
   - Preview on a sample market — watch the agents work
4. Deploy the team
5. Watch agents analyze markets and make decisions in real-time
6. Track performance on dashboard

### Flow 2: Create & Deploy Agent Team
1. Navigate to "My Teams" → "Create Team"
2. Step 1: Name + avatar
3. Step 2: Write team strategy (with examples/templates)
4. Step 3: Select risk profile
5. Step 4: Set bankroll
6. Step 5 (optional): Advanced per-agent config
7. Preview: Full pipeline demo on a real market
8. Deploy → team begins analyzing open markets

### Flow 3: Monitor & Adjust
1. View team dashboard — see live positions, PnL, recent activity
2. Click into a specific trade — see full decision chain
3. Notice the team is too aggressive on crypto → adjust strategy prompt
4. Disable the team temporarily during high volatility
5. Re-enable with updated strategy

### Flow 4: Browse & Manual Bet
1. Browse markets on dashboard
2. Click into market detail
3. View odds chart, agent consensus, recent trades
4. Place a manual bet or let agents handle it
5. Track position in portfolio

---

## 5. Data Model

### Market
- id, question, description, category, resolution_date
- current_yes_price, current_no_price, volume
- status: open | closed | resolved
- resolved_outcome: yes | no | null
- created_at

### Agent Team
- id, user_id, name, avatar
- strategy_prompt (team-level investment thesis)
- risk_profile: conservative | moderate | aggressive
- bankroll, initial_bankroll
- is_active
- created_at, updated_at

### Agent Config (per-agent overrides within a team)
- id, team_id
- agent_role: orchestrator | researcher | analyst | risk_manager | executor
- config_json (role-specific settings)
- model_override (use a specific model for this agent)
- is_active

### Position
- id, team_id, market_id
- side: yes | no
- shares, avg_price
- status: open | closed
- realized_pnl
- created_at

### Trade
- id, team_id, market_id
- action: buy | sell
- side: yes | no
- shares, price, amount
- created_at

### Pipeline Run (one full decision cycle)
- id, team_id, market_id
- status: running | completed | failed | timeout
- started_at, completed_at
- total_tokens_used, total_cost_estimate

### Agent Output (per-agent output within a pipeline run)
- id, pipeline_run_id, agent_role
- input_data (JSON — what the agent received)
- output_data (JSON — what the agent produced)
- reasoning (text — human-readable explanation)
- tokens_used, latency_ms
- created_at

### Price History
- id, market_id
- yes_price, no_price, volume
- recorded_at

---

## 6. Multi-Agent System Requirements

### 6.1 Orchestrator Requirements
- Manage pipeline execution order (research → analysis → risk → execution)
- Handle timeouts (kill stuck agents after 30s)
- Handle failures (retry with backoff, or skip with explanation)
- Aggregate and pass state between agents
- Enforce max debate rounds (3) to prevent infinite loops
- Inject "semantic anchor" (global context) into every agent prompt to prevent context drift
- Track and report pipeline health metrics

### 6.2 Researcher Requirements
- Fetch current market data (odds, volume, recent trades)
- Gather related market context (correlated markets)
- Analyze market description and resolution criteria
- Produce a structured research brief for the Analyst
- Output: `{ market_summary, key_factors[], data_points[], sentiment_signals[], confidence_in_data: 0-1 }`

### 6.3 Analyst Requirements
- Receive research brief from Researcher
- Run adversarial analysis (Bull vs Bear debate)
- Bull sub-agent: build strongest case FOR the trade
- Bear sub-agent: build strongest case AGAINST the trade
- Synthesize into a trade signal
- Output: `{ signal: "buy_yes" | "buy_no" | "hold", confidence: 0-1, bull_case: string, bear_case: string, synthesis: string, suggested_amount_pct: number }`

### 6.4 Risk Manager Requirements
- Receive trade signal from Analyst + current portfolio state
- Check position sizing rules (based on risk profile)
- Check portfolio concentration (max % in one category)
- Check drawdown state (pause trading if down > threshold)
- Check correlation (don't double down on correlated markets)
- Can APPROVE (with position size), REDUCE (lower the size), or VETO (block the trade)
- Output: `{ decision: "approve" | "reduce" | "veto", approved_amount: number, reasoning: string, risk_flags: string[] }`

### 6.5 Executor Requirements
- Receive approved trade from Risk Manager
- Calculate trade execution details (shares, price impact)
- Execute against the AMM
- Update positions and bankroll
- Log complete trade record
- Output: `{ executed: boolean, trade_details: Trade, new_bankroll: number, new_position: Position }`

### 6.6 Cross-Cutting Requirements
- **Semantic Anchor**: Every agent receives the team's strategy prompt + current portfolio summary to stay aligned
- **Max 3 debate rounds** in adversarial analysis to prevent loops
- **Token budget**: Track cumulative tokens per pipeline run; abort if exceeding budget
- **Model selection per role**: Use fast/cheap models (GPT-4o-mini) for Researcher/Executor, powerful models (GPT-4o) for Analyst/Risk Manager
- **Full auditability**: Every input/output/reasoning logged and queryable

---

## 7. Risk Profile Parameters

| Parameter | Conservative | Moderate | Aggressive |
|---|---|---|---|
| Max single bet | 3% of bankroll | 8% of bankroll | 15% of bankroll |
| Max position per market | 10% of bankroll | 20% of bankroll | 35% of bankroll |
| Max category exposure | 25% of bankroll | 40% of bankroll | 60% of bankroll |
| Drawdown pause threshold | -8% | -15% | -25% |
| Min confidence to trade | 0.75 | 0.60 | 0.45 |
| Max concurrent positions | 5 | 10 | 20 |
| Debate rounds (bull/bear) | 3 | 2 | 1 |

---

## 8. Non-Functional Requirements

- **Performance**: Dashboard < 2s load. Full pipeline < 60s. Individual agent < 15s.
- **Scalability**: 100+ concurrent agent teams, 50+ active markets
- **Reliability**: Pipeline retries on failure, graceful degradation (skip agent if down)
- **Security**: No real money. API keys server-side only. Rate limiting on LLM calls.
- **Observability**: Full pipeline traces, token usage, latency metrics, error rates
- **Responsiveness**: Desktop-first, mobile-friendly. Dark theme trading aesthetic.
- **Cost Control**: Token budget per pipeline run. Cheaper models for simple tasks.

---

## 9. Success Metrics

- Number of agent teams created
- Pipeline executions per day
- Average pipeline success rate
- Agent team performance distribution
- User retention (return visits)
- Leaderboard engagement
- Decision viewer usage (are users reviewing agent reasoning?)
- Average session duration
