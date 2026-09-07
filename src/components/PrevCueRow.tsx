import { ms } from "../lib/parse";
import type { ParsedCue } from "../types";
import styles from "./PrevCueRow.module.css";

interface Props {
  cue: ParsedCue | null;
  t: number;
  onJump: (t: number) => void;
}

/** The cue that just finished, kept on screen in gray so it's still there to refer back to. */
export function PrevCueRow({ cue, t, onJump }: Props) {
  if (!cue) return null;

  const action = cue.action || "watch only";

  return (
    <div className={styles.row} onClick={() => onJump(cue.t)} title={action}>
      <div>
        <div className={styles.label}>JUST FIRED</div>
        <div className={styles.since}>−{ms(t - cue.t)}</div>
      </div>
      <div className={styles.cell}>
        <div className={styles.scene}>{cue.scene}</div>
        <div className={styles.action}>{action}</div>
      </div>
      <div className={styles.tc}>{cue.time}</div>
    </div>
  );
}
