import { forwardRef } from "react";
import type { ParsedCue, RowState } from "../types";
import { CueRow } from "./CueRow";
import styles from "./CueList.module.css";

interface Props {
  cues: ParsedCue[];
  currentIndex: number;
  t: number;
  onJump: (t: number) => void;
  registerRow: (index: number, el: HTMLDivElement | null) => void;
}

function rowState(index: number, currentIndex: number): RowState {
  if (index === currentIndex) return "now";
  if (index < currentIndex) return "past";
  if (index === currentIndex + 1) return "next";
  return "future";
}

export const CueList = forwardRef<HTMLDivElement, Props>(function CueList(
  { cues, currentIndex, t, onJump, registerRow },
  ref,
) {
  return (
    <div className={styles.list} ref={ref} data-cuelist="1">
      <div className={styles.header}>
        <div>IN</div>
        <div>SCENE · CUE</div>
        <div className={styles.headerWho}>WHO · ITEMS</div>
        <div className={styles.headerTc}>TC</div>
      </div>
      {cues.length === 0 && <div className={styles.empty}>NO CUES TO SHOW</div>}
      {cues.map((cue) => (
        <CueRow
          cue={cue}
          state={rowState(cue.index, currentIndex)}
          t={t}
          onJump={onJump}
          registerRow={registerRow}
          key={cue.index}
        />
      ))}
      <div className={styles.spacer} />
    </div>
  );
});
