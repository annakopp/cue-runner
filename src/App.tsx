/* oxlint-disable react/refs -- this file only forwards runner.listRef as a prop, it never reads .current during render */
import { useCueRunner } from "./hooks/useCueRunner";
import defaultCues from "./data/defaultCues.json";
import { Transport } from "./components/Transport";
import { Minimap } from "./components/Minimap";
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
      <Minimap
        cues={runner.cues}
        t={runner.t}
        timelineLength={runner.timelineLength}
        onSeek={runner.jumpTo}
      />
      <GoCard
        current={runner.goCue}
        elapsed={runner.elapsed}
        waiting={runner.waitingForCue}
        firstTime={runner.cues[0]?.time ?? null}
      />
      <StandbyStrip upcoming={runner.upcoming} />
      <CueList
        ref={runner.listRef}
        cues={runner.listCues}
        currentIndex={runner.currentIndex}
        t={runner.t}
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
