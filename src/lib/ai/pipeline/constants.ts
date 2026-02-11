export const TIMEOUTS = {
  RESEARCHER: 15_000,
  ANALYST: 20_000,
  RISK_MANAGER: 12_000,
  EXECUTOR: 8_000,
  PIPELINE_TOTAL: 120_000
} as const;

export const PIPELINE_MODEL_MAP = {
  researcher: "gpt-4o-mini",
  analyst: "gpt-4o",
  risk_manager: "gpt-4o"
} as const;
