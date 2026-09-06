import type { MouseEvent } from "react";
import type { ParsedCue } from "../types";
import styles from "./Minimap.module.css";

interface Props {
  cues: ParsedCue[];
  t: number;
  timelineLength: number;
  onSeek: (seconds: number) => void;
}

/** The whole show at a glance: one tick per cue across the film's runtime, plus a playhead. */
export function Minimap({ cues, t, timelineLength, onSeek }: Props) {
  const pct = (seconds: number) => `${Math.min(100, Math.max(0, (seconds / timelineLength) * 100))}%`;

  const hours: number[] = [];
  for (let h = 3600; h < timelineLength; h += 3600) hours.push(h);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    onSeek(Math.round(Math.min(1, Math.max(0, fraction)) * timelineLength));
  }

  return (
    <div className={styles.minimap} title="Click to jump to a point in the show">
      <div className={styles.track} onClick={handleClick}>
        {hours.map((h) => (
          <div className={styles.hourLine} style={{ left: pct(h) }} key={h} />
        ))}
        {cues.map((cue) => (
          <div
            className={styles.tick}
            style={{
              left: pct(cue.t),
              background: cue.groups[0]?.color ?? "var(--text-faint)",
              opacity: cue.t <= t ? 0.4 : 1,
            }}
            key={cue.index}
          />
        ))}
        <div className={styles.past} style={{ width: pct(t) }} />
        <div className={styles.playhead} style={{ left: pct(t) }} />
        <div className={styles.playheadCap} style={{ left: pct(t) }} />
      </div>
      <div className={styles.labels}>
        {hours.map((h) => (
          <div className={styles.hourLabel} style={{ left: pct(h) }} key={h}>
            {h / 3600}:00
          </div>
        ))}
      </div>
    </div>
  );
}
