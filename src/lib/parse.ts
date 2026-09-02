import { colorForCategory } from "./categoryColors";
import type { CueList, Group, Item, ParsedCue, RawCue } from "../types";

// Leading emoji (with variation-selector/ZWJ sequences for compound emoji) plus the rest of the string.
const EMOJI_RE = new RegExp(
  "^(\\p{Extended_Pictographic}[\\uFE0F\\u200D\\p{Extended_Pictographic}]*)\\s*(.*)$",
  "u",
);

export function splitItem(raw: string): Item {
  const s = raw.trim();
  const m = s.match(EMOJI_RE);
  return m ? { emoji: m[1], name: m[2] || "item" } : { emoji: "•", name: s };
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formats seconds as HH:MM:SS. */
export function hms(t: number): string {
  t = Math.max(0, Math.round(t));
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
}

/** Parses "HH:MM:SS" into seconds, or null if not a valid timecode. */
export function secs(s: string | undefined): number | null {
  const parts = String(s ?? "")
    .split(":")
    .map((n) => parseInt(n, 10));
  return parts.length === 3 && parts.every((n) => !isNaN(n))
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : null;
}

/** Formats a duration (elapsed/countdown) as M:SS, or H:MM:SS once past an hour. */
export function ms(t: number): string {
  if (t < 0) t = 0;
  t = Math.round(t);
  const h = Math.floor(t / 3600);
  return `${h ? h + ":" + pad(Math.floor(t / 60) % 60) : Math.floor(t / 60)}:${pad(t % 60)}`;
}

function parseGroups(c: RawCue, items: Item[]): Group[] {
  const cats = String(c.category ?? "")
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);
  const whos = String(c.who ?? "")
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);

  if (Array.isArray(c.groups) && c.groups.length) {
    return c.groups.map((g) => {
      const who = g.who || "unassigned";
      const category = String(g.category ?? "").toUpperCase();
      return {
        who,
        category,
        label: who + (g.category ? " · " + category : ""),
        color: colorForCategory(g.category ?? ""),
        items: (g.items ?? []).map(splitItem),
      };
    });
  }

  if (whos.length > 1 && whos.length === cats.length) {
    return whos.map((w, k) => ({
      who: w,
      category: cats[k].toUpperCase(),
      label: w + " · " + cats[k].toUpperCase(),
      color: colorForCategory(cats[k]),
      items: k === 0 ? items : [],
    }));
  }

  if (whos.length || cats.length || items.length) {
    const who = whos.join(" · ") || "unassigned";
    const cat = cats.join(" · ").toUpperCase();
    return [
      {
        who,
        category: cat,
        label: who + (cat ? " · " + cat : ""),
        color: colorForCategory(cats[0] ?? ""),
        items,
      },
    ];
  }

  return [];
}

export function parseCue(c: RawCue, index: number): ParsedCue {
  const items = String(c.item ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map(splitItem);

  return {
    index,
    t: secs(c.timestamp) ?? 0,
    time: c.timestamp,
    action: c.action || "",
    scene: c.scene || "",
    groups: parseGroups(c, items),
  };
}

export function parseCueList(list: CueList): ParsedCue[] {
  return list.cues.map(parseCue);
}
