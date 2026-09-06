import type { ParsedCue } from "../types";
import styles from "./GoCard.module.css";

interface Props {
  current: ParsedCue | null;
  elapsed: string;
  waiting: boolean;
  firstTime: string | null;
}

export function GoCard({ current, elapsed, waiting, firstTime }: Props) {
  if (!current) {
    return (
      <div className={styles.card}>
        <div className={styles.empty}>
          <div className={styles.emptyLabel}>{waiting ? "NO ACTIVE CUE" : "NO CUE YET"}</div>
          <div className={styles.emptyText}>
            {waiting
              ? "waiting for next cue"
              : firstTime
                ? `first cue at ${firstTime} — hit RUN when the film starts`
                : "no cues loaded"}
          </div>
        </div>
      </div>
    );
  }

  const action = current.action || "watch only — no action";
  const size = action.length > 70 ? "clamp(22px,3.4vh,38px)" : "clamp(26px,4.6vh,52px)";

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.header}>
          <div className={styles.headerLabel}>GO — RUNNING NOW</div>
          <div className={styles.headerTime}>{current.time}</div>
          <div className={styles.headerElapsed}>+{elapsed}</div>
        </div>
        <div className={current.extra ? `${styles.body} ${styles.bodyWithExtra}` : styles.body}>
          <div>
            <div className={styles.scene}>{current.scene}</div>
            <div className={styles.action} style={{ fontSize: size }}>
              {action}
            </div>
          </div>
          <div className={styles.groups}>
            {current.groups.map((g, gi) => (
              <div className={styles.block} key={gi}>
                <div className={styles.blockHeader}>
                  <span className={styles.dot} style={{ background: g.color }} />
                  <span className={styles.who}>{g.who}</span>
                  <span className={styles.category}>{g.category}</span>
                </div>
                <div className={styles.items}>
                  {g.items.map((it, ii) => (
                    <div className={styles.chip} key={ii}>
                      <span className={styles.chipEmoji}>{it.emoji}</span>
                      <span className={styles.chipName}>{it.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {current.extra && (
            <div className={styles.extra}>
              <div className={styles.extraHeader}>EXTRA INFO</div>
              <div className={styles.extraBody}>{current.extra}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
