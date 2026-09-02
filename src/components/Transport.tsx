import type { ChangeEvent } from "react";
import type { CueRunner } from "../hooks/useCueRunner";
import styles from "./Transport.module.css";

interface Props {
  runner: CueRunner;
  film: string;
  cueCount: number;
}

export function Transport({ runner, film, cueCount }: Props) {
  const { clock, playing, syncText, toggle, nudge, reset, onSyncChange } = runner;

  return (
    <div className={styles.transport}>
      <div>
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
      </div>
      <div className={styles.spacer} />
      <div className={styles.titleBlock}>
        {film}
        <br />
        <span className={styles.titleSub}>prompt book · {cueCount} cues</span>
      </div>
      <div>
        <div className={styles.label}>SYNC TO FILM</div>
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
