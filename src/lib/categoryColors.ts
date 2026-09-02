export const CAT_COLORS: Record<string, string> = {
  wet: "oklch(0.72 0.11 235)",
  "lighting, fire and wind": "oklch(0.82 0.12 75)",
  fighting: "oklch(0.7 0.16 25)",
  human: "oklch(0.72 0.12 340)",
  misc: "oklch(0.7 0.02 250)",
  "food & drink": "oklch(0.75 0.13 140)",
  ring: "oklch(0.72 0.13 300)",
  furniture: "oklch(0.72 0.1 195)",
};

export const FALLBACK_COLOR = "oklch(0.7 0.02 250)";

export function colorForCategory(cat: string): string {
  return CAT_COLORS[cat.trim().toLowerCase()] ?? FALLBACK_COLOR;
}
