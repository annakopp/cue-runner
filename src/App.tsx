/* oxlint-disable react/refs -- this file only forwards runner.listRef as a prop, it never reads .current during render */
import { useCueRunner } from "./hooks/useCueRunner";
import defaultCues from "./data/defaultCues.json";
import { Transport } from "./components/Transport";
import { GoCard } from "./components/GoCard";
import { StandbyStrip } from "./components/StandbyStrip";
import { CueList } from "./components/CueList";
import { Footer } from "./components/Footer";
import type { CueList as CueListType } from "./types";

const DEFAULT_LIST = defaultCues as CueListType;

export default function App() {
  const runner = useCueRunner(DEFAULT_LIST);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-page)",
        overflow: "hidden",
      }}
    >
      <Transport runner={runner} film={runner.film ?? ""} cueCount={runner.cues.length} />
      <GoCard
        current={runner.current}
        elapsed={runner.elapsed}
        firstTime={runner.cues[0]?.time ?? null}
      />
      <StandbyStrip next={runner.next} countdown={runner.countdown} imminent={runner.imminent} />
      <CueList
        ref={runner.listRef}
        cues={runner.cues}
        currentIndex={runner.currentIndex}
        onJump={runner.jumpTo}
        registerRow={runner.registerRow}
      />
      <Footer
        onJumpToNow={runner.scrollToNow}
        cueList={runner.rawCueList}
        onLoadCueList={runner.loadNewCueList}
      />
    </div>
  );
}
