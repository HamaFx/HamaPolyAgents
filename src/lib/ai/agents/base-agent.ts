export interface AgentExecutionResult<T> {
  output: T;
  reasoning: string;
  tokensUsed: number;
  latencyMs: number;
  costEstimate: number;
}

export abstract class BaseAgent<I, O> {
  constructor(readonly role: string) {}

  protected abstract run(input: I): Promise<AgentExecutionResult<O>>;

  async execute(input: I): Promise<AgentExecutionResult<O>> {
    const startedAt = Date.now();
    const result = await this.run(input);
    return {
      ...result,
      latencyMs: Math.max(result.latencyMs, Date.now() - startedAt)
    };
  }
}
