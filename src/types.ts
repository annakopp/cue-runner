export interface RawCue {
  timestamp: string;
  action?: string;
  scene?: string;
  item?: string;
  category?: string;
  who?: string;
  groups?: RawGroup[];
}

export interface RawGroup {
  who?: string;
  category?: string;
  items?: string[];
}

export interface CueList {
  film?: string;
  runtime?: string;
  cues: RawCue[];
}

export interface Item {
  emoji: string;
  name: string;
}

export interface Group {
  who: string;
  category: string;
  label: string;
  color: string;
  items: Item[];
}

export interface ParsedCue {
  index: number;
  t: number;
  time: string;
  action: string;
  scene: string;
  groups: Group[];
}

export type RowState = "past" | "now" | "next" | "future";
