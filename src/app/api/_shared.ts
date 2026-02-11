import { NextResponse } from "next/server";
import { z } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request, schema: z.ZodType<T>): Promise<{ data?: T; error?: string }> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return {
        error: parsed.error.issues.map((issue) => issue.message).join("; ")
      };
    }
    return { data: parsed.data };
  } catch {
    return {
      error: "Invalid JSON body."
    };
  }
}
