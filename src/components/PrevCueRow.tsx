import { ms } from "../lib/parse";
import type { ParsedCue } from "../types";
import { PersonGroupInline } from "./PersonGroupInline";
import styles from "./PrevCueRow.module.css";

interface Props {
  cue: ParsedCue | null;
  t: number;
  onJump: (t: number) => void;
}

/** The cue that just finished, kept on screen in gray so it's still there to refer back to. */
export function PrevCueRow({ cue, t, onJump }: Props) {
  if (!cue) return null;

  return (
    <div className={styles.row} onClick={() => onJump(cue.t)}>
      <div>
        <div className={styles.label}>JUST FIRED</div>
        <div className={styles.since}>−{ms(t - cue.t)}</div>
      </div>
      <div>
        <div className={styles.scene}>{cue.scene}</div>
        <div className={styles.action}>{cue.action || "watch only"}</div>
      </div>
      <div className={styles.groups}>
        {cue.groups.map((g, i) => (
          <PersonGroupInline
            group={g}
            headerColor="var(--text-past-dim)"
            dotOpacity={0.45}
            key={i}
          />
        ))}
      </div>
      <div className={styles.tc}>{cue.time}</div>
    </div>
  );
}
