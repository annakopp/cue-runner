import { ms } from "../lib/parse";
import type { ParsedCue, RowState } from "../types";
import { PersonGroupInline } from "./PersonGroupInline";
import styles from "./CueRow.module.css";

interface Props {
  cue: ParsedCue;
  state: RowState;
  t: number;
  onJump: (t: number) => void;
  registerRow: (index: number, el: HTMLDivElement | null) => void;
}

const ROW_STYLE: Record<RowState, { fg: string; dim: string; weight: number; dotOpacity: number; bg: string; bar: string }> = {
  past: { fg: "var(--text-past)", dim: "var(--text-past-dim)", weight: 400, dotOpacity: 0.45, bg: "transparent", bar: "transparent" },
  now: { fg: "var(--text-hi)", dim: "var(--text-dim)", weight: 600, dotOpacity: 1, bg: "var(--bg-row-now)", bar: "var(--go)" },
  next: { fg: "var(--text)", dim: "var(--text-dim)", weight: 400, dotOpacity: 1, bg: "transparent", bar: "transparent" },
  future: { fg: "var(--text)", dim: "var(--text-dim)", weight: 400, dotOpacity: 1, bg: "transparent", bar: "transparent" },
};

export function CueRow({ cue, state, t, onJump, registerRow }: Props) {
  const s = ROW_STYLE[state];
  const action = cue.action || "watch only";
  const gap = cue.t - t;
  // Time to the cue is what the operator needs; a fired cue counts up instead.
  const countdown = gap > 0 ? ms(gap) : `−${ms(-gap)}`;

  return (
    <div
      ref={(el) => registerRow(cue.index, el)}
      className={styles.row}
      onClick={() => onJump(cue.t)}
      style={{
        color: s.fg,
        background: s.bg,
        borderLeftColor: s.bar,
        fontWeight: s.weight,
      }}
    >
      <div className={styles.countdown} style={{ color: gap > 0 ? s.fg : s.dim }}>
        {countdown}
      </div>
      <div>
        <div className={styles.scene} style={{ color: s.dim }}>
          {cue.scene}
        </div>
        <div className={styles.action} style={{ fontStyle: cue.action ? "normal" : "italic" }}>
          {action}
        </div>
      </div>
      <div className={styles.groups}>
        {cue.groups.map((g, i) => (
          <PersonGroupInline group={g} headerColor={s.dim} dotOpacity={s.dotOpacity} key={i} />
        ))}
      </div>
      <div className={styles.tc} style={{ color: s.dim }}>
        {cue.time}
      </div>
    </div>
  );
}
