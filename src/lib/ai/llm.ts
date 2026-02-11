import OpenAI from "openai";
import { z, ZodSchema } from "zod";

const MODEL_COST_PER_1K: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 }
};

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return null;
  }
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const rate = MODEL_COST_PER_1K[model];
  if (!rate) {
    return 0;
  }
  return (promptTokens / 1000) * rate.input + (completionTokens / 1000) * rate.output;
}

function parseJsonFromContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const trimmed = content.trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("LLM response did not contain valid JSON.");
  }
}

interface StructuredCallInput<T extends z.ZodTypeAny> {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  schema: T;
  fallback: () => z.infer<T>;
}

export interface StructuredCallResult<T> {
  output: T;
  tokensUsed: number;
  costEstimate: number;
  raw: string;
}

export async function callStructuredLLM<T extends z.ZodTypeAny>(
  input: StructuredCallInput<T>
): Promise<StructuredCallResult<z.infer<T>>> {
  const openai = getOpenAIClient();
  if (!openai) {
    const output = input.fallback();
    return {
      output,
      tokensUsed: 0,
      costEstimate: 0,
      raw: "fallback"
    };
  }

  let lastError: unknown;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await openai.chat.completions.create({
        model: input.model,
        response_format: { type: "json_object" },
        temperature: 0.25,
        messages: [
          {
            role: "system",
            content: input.systemPrompt
          },
          {
            role: "user",
            content: `${input.userPrompt}\n\nReturn JSON that matches the schema exactly.`
          }
        ]
      });

      const content = response.choices[0]?.message?.content ?? "{}";
      const parsed = parseJsonFromContent(content);
      const output = input.schema.parse(parsed);

      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const totalTokens = response.usage?.total_tokens ?? promptTokens + completionTokens;

      return {
        output,
        raw: content,
        tokensUsed: totalTokens,
        costEstimate: estimateCost(input.model, promptTokens, completionTokens)
      };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await sleep(2 ** attempt * 400);
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Structured LLM call failed after retries.");
}

export function parseWithSchema<T>(schema: ZodSchema<T>, payload: unknown): T {
  return schema.parse(payload);
}
