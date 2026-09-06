import { CLOCK_STORAGE_KEY, CUES_STORAGE_KEY, PREFS_STORAGE_KEY } from "./config";
import type { CueList } from "../types";

export interface SavedClockState {
  t: number;
}

export interface Prefs {
  hideActive: boolean;
}

export function loadPrefs(): Partial<Prefs> {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) ?? "{}");
    return typeof raw.hideActive === "boolean" ? { hideActive: raw.hideActive } : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable — the preference still applies for this session
  }
}

export function loadClockState(): SavedClockState | null {
  try {
    const raw = JSON.parse(localStorage.getItem(CLOCK_STORAGE_KEY) ?? "{}");
    return typeof raw.t === "number" ? { t: raw.t } : null;
  } catch {
    return null;
  }
}

export function saveClockState(state: SavedClockState): void {
  try {
    localStorage.setItem(CLOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) — clock position just won't survive a refresh
  }
}

export function loadCueList(): CueList | null {
  try {
    const raw = localStorage.getItem(CUES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CueList) : null;
  } catch {
    return null;
  }
}

export function saveCueList(list: CueList): void {
  try {
    localStorage.setItem(CUES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable — the imported list still applies for this session
  }
}

export function clearCueList(): void {
  try {
    localStorage.removeItem(CUES_STORAGE_KEY);
  } catch {
    // ignore
  }
}
