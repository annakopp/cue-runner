import type { ParsedCue } from "../types";
import { PersonGroupInline } from "./PersonGroupInline";
import styles from "./StandbyStrip.module.css";

export interface UpcomingCue {
  cue: ParsedCue;
  countdown: string;
  imminent: boolean;
}

interface Props {
  upcoming: UpcomingCue[];
}

export function StandbyStrip({ upcoming }: Props) {
  if (!upcoming.length) return null;

  const imminent = upcoming[0].imminent;
  const labelColor = imminent ? "var(--standby)" : "var(--text-mid)";

  return (
    <div
      className={styles.strip}
      style={{ background: imminent ? "var(--bg-strip-standby)" : "var(--bg-strip)" }}
    >
      <div className={styles.labelRow}>
        <div className={styles.label} style={{ color: labelColor }}>
          {imminent ? "STANDBY — COMING UP" : "NEXT UP"}
        </div>
      </div>
      {upcoming.map(({ cue, countdown, imminent: cueImminent }, i) => (
        <div
          className={i === 0 ? styles.grid : `${styles.grid} ${styles.secondary}`}
          key={cue.index}
        >
          <div>
            {i === 0 && <div className={styles.inLabel}>IN</div>}
            <div
              className={styles.countdown}
              style={{ color: cueImminent ? "var(--standby)" : "var(--text-mid)" }}
            >
              {countdown}
            </div>
          </div>
          <div>
            <div className={styles.scene}>{cue.scene}</div>
            <div className={styles.action}>{cue.action || "watch only"}</div>
          </div>
          <div className={styles.groups}>
            {cue.groups.map((g, gi) => (
              <PersonGroupInline group={g} key={gi} />
            ))}
          </div>
          <div className={styles.tc}>{cue.time}</div>
        </div>
      ))}
    </div>
  );
}
