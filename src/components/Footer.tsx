import styles from "./Footer.module.css";

export function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.legend}>
        SPACE RUN/HOLD · ←→ ±5s · J/K PREV/NEXT CUE · CLICK A ROW TO JUMP
      </div>
    </div>
  );
}
