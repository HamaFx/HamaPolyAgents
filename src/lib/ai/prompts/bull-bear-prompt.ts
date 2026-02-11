export function bullCasePrompt(context: string): string {
  return `Argue the strongest bullish thesis for this market context. Keep it evidence based.\n\n${context}`;
}

export function bearCasePrompt(context: string): string {
  return `Argue the strongest bearish thesis for this market context. Critique assumptions and confidence.\n\n${context}`;
}
