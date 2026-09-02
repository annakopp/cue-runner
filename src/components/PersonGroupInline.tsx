import type { Group } from "../types";
import styles from "./PersonGroupInline.module.css";

interface Props {
  group: Group;
  headerColor?: string;
  dotOpacity?: number;
}

export function PersonGroupInline({ group, headerColor, dotOpacity = 1 }: Props) {
  return (
    <div className={styles.group}>
      <div className={styles.header} style={headerColor ? { color: headerColor } : undefined}>
        <span className={styles.dot} style={{ background: group.color, opacity: dotOpacity }} />
        {group.label}
      </div>
      <div className={styles.items}>
        {group.items.map((it, i) => (
          <span className={styles.item} key={i}>
            <span className={styles.itemEmoji}>{it.emoji}</span>
            {it.name}
          </span>
        ))}
      </div>
    </div>
  );
}
