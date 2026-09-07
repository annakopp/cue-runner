import { CLOCK_STORAGE_KEY } from "./config";

export interface SavedClockState {
  t: number;
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
