import type { CueList, RawCue } from "../types";

export class CueListParseError extends Error {}

function isRawCue(v: unknown): v is RawCue {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).timestamp === "string"
  );
}

/** Parses and validates a cue-list JSON string. Throws CueListParseError with a human-readable reason. */
export function parseCueListJson(text: string): CueList {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new CueListParseError("Not valid JSON.");
  }

  // Accept either { cues: [...] } or a bare array of cues.
  const raw = data as Record<string, unknown>;
  const cues = Array.isArray(data) ? data : raw?.cues;

  if (!Array.isArray(cues)) {
    throw new CueListParseError(
      'Expected an object with a "cues" array, or a bare array of cues.',
    );
  }
  if (!cues.every(isRawCue)) {
    throw new CueListParseError(
      'Every cue needs at least a string "timestamp" field (e.g. "01:02:10").',
    );
  }

  return {
    film: typeof raw?.film === "string" ? raw.film : undefined,
    runtime: typeof raw?.runtime === "string" ? raw.runtime : undefined,
    cues,
  };
}

export function downloadCueList(list: CueList, filename = "cues.json"): void {
  const blob = new Blob([JSON.stringify(list, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
