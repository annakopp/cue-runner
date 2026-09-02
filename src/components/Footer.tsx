import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { CueListParseError, downloadCueList, parseCueListJson } from "../lib/cueListIO";
import type { CueList } from "../types";
import styles from "./Footer.module.css";

interface Props {
  onJumpToNow: () => void;
  cueList: CueList;
  onLoadCueList: (list: CueList) => void;
}

export function Footer({ onJumpToNow, cueList, onLoadCueList }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file
      .text()
      .then((text) => {
        const list = parseCueListJson(text);
        onLoadCueList(list);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof CueListParseError ? err.message : "Couldn't read that file.");
      });
  }

  return (
    <div className={styles.footer}>
      <div className={styles.btn} onClick={onJumpToNow}>
        JUMP TO NOW
      </div>
      <div className={styles.btn} onClick={() => fileInputRef.current?.click()}>
        LOAD CUE LIST
      </div>
      <div className={styles.btn} onClick={() => downloadCueList(cueList)}>
        EXPORT CUE LIST
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className={styles.fileInput}
        onChange={handleFile}
      />
      {error && <div style={{ color: "var(--hold)" }}>{error}</div>}
      <div className={styles.spacer} />
      <div className={styles.legend}>SPACE RUN/HOLD · ←→ ±5s · J/K PREV/NEXT CUE · CLICK A ROW TO JUMP</div>
    </div>
  );
}
