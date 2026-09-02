import type { ParsedCue } from "../types";
import { PersonGroupInline } from "./PersonGroupInline";
import styles from "./StandbyStrip.module.css";

interface Props {
  next: ParsedCue | null;
  countdown: string;
  imminent: boolean;
}

export function StandbyStrip({ next, countdown, imminent }: Props) {
  if (!next) return null;

  const labelColor = imminent ? "var(--standby)" : "var(--text-mid)";

  return (
    <div
      className={styles.strip}
      style={{ background: imminent ? "var(--bg-strip-standby)" : "var(--bg-strip)" }}
    >
      <div className={styles.labelRow}>
        <div className={styles.label} style={{ color: labelColor }}>
          {imminent ? "STANDBY — COMING UP" : "NEXT"}
        </div>
      </div>
      <div className={styles.grid}>
        <div>
          <div className={styles.inLabel}>IN</div>
          <div className={styles.countdown} style={{ color: labelColor }}>
            {countdown}
          </div>
        </div>
        <div>
          <div className={styles.scene}>{next.scene}</div>
          <div className={styles.action}>{next.action || "watch only"}</div>
        </div>
        <div className={styles.groups}>
          {next.groups.map((g, i) => (
            <PersonGroupInline group={g} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
