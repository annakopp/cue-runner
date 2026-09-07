import type { ChangeEvent } from "react";
import type { CueRunner } from "../hooks/useCueRunner";
import styles from "./Transport.module.css";

interface Props {
  runner: CueRunner;
  film: string;
  cueCount: number;
}

export function Transport({ runner, film, cueCount }: Props) {
  const { clock, playing, syncText, toggle, nudge, reset, onSyncChange, scrollToNow } = runner;

  return (
    <div className={styles.transport}>
      <div className={styles.clockGroup}>
        <div className={styles.label}>SHOW TIME</div>
        <div className={styles.clock}>{clock}</div>
      </div>
      <div className={styles.controls}>
        <div className={styles.ctlBtn} onClick={() => nudge(-5)}>
          −5s
        </div>
        <div
          className={styles.transportBtn}
          style={{ background: playing ? "var(--hold)" : "var(--run)" }}
          onClick={toggle}
        >
          <span className={styles.transportGlyph}>{playing ? "❚❚" : "▶"}</span>
          <span>{playing ? "HOLD" : "RUN"}</span>
        </div>
        <div className={styles.ctlBtn} onClick={() => nudge(5)}>
          +5s
        </div>
        <div className={styles.resetBtn} onClick={reset}>
          RESET
        </div>
        <div className={styles.jumpBtn} onClick={scrollToNow}>
          JUMP TO NOW
        </div>
      </div>
      <div className={styles.spacer} />
      <div className={styles.titleBlock}>
        {film} <span className={styles.titleSub}>· {cueCount} cues</span>
      </div>
      <div className={styles.syncGroup}>
        <div className={styles.label}>SYNC</div>
        <input
          type="text"
          className={styles.syncInput}
          value={syncText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSyncChange(e.target.value)}
        />
      </div>
    </div>
  );
}
