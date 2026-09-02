import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AUTO_SCROLL, STANDBY_LEAD_SECONDS } from "../lib/config";
import { hms, ms, parseCue, secs } from "../lib/parse";
import {
  loadClockState,
  loadCueList,
  saveClockState,
  saveCueList,
  clearCueList,
} from "../lib/storage";
import type { CueList, ParsedCue, RawCue } from "../types";

export function useCueRunner(defaultList: CueList) {
  const [film, setFilm] = useState(() => loadCueList()?.film ?? defaultList.film);
  const [rawCues, setRawCues] = useState<RawCue[]>(() => loadCueList()?.cues ?? defaultList.cues);
  const cues = useMemo<ParsedCue[]>(() => rawCues.map(parseCue), [rawCues]);

  const [t, setT] = useState(() => loadClockState()?.t ?? 0);
  const [playing, setPlaying] = useState(false);
  const [syncText, setSyncText] = useState(() => hms(loadClockState()?.t ?? 0));

  const listRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const lastIndexRef = useRef<number | null>(null);
  const tRef = useRef(t);

  const currentIndex = useMemo(() => {
    let idx = -1;
    for (let k = 0; k < cues.length; k++) {
      if (cues[k].t <= t) idx = k;
      else break;
    }
    return idx;
  }, [cues, t]);

  const latest = useRef({ t, cues, currentIndex });
  useEffect(() => {
    latest.current = { t, cues, currentIndex };
    tRef.current = t;
  });

  // Tick the clock once a second while playing.
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setT((prev) => {
        const next = prev + 1;
        setSyncText(hms(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing]);

  // Persist clock position periodically and on unmount, so a refresh mid-show keeps your place.
  useEffect(() => {
    const iv = setInterval(() => saveClockState({ t: tRef.current }), 3000);
    return () => {
      clearInterval(iv);
      saveClockState({ t: tRef.current });
    };
  }, []);

  const registerRow = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(index, el);
    else rowRefs.current.delete(index);
  }, []);

  const scrollToNow = useCallback(() => {
    const container = listRef.current;
    if (!container) return;
    const idx = Math.max(0, latest.current.currentIndex);
    const row = rowRefs.current.get(idx);
    if (!row) return;
    const delta = row.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTop = Math.max(0, container.scrollTop + delta - 90);
  }, []);

  // Auto-scroll whenever the current cue changes (including the initial restore from storage).
  useEffect(() => {
    if (lastIndexRef.current === currentIndex) return;
    lastIndexRef.current = currentIndex;
    if (!AUTO_SCROLL) return;
    const id = setTimeout(scrollToNow, 60);
    return () => clearTimeout(id);
  }, [currentIndex, scrollToNow]);

  const nudge = useCallback((delta: number) => {
    setT((prev) => {
      const next = Math.max(0, prev + delta);
      setSyncText(hms(next));
      return next;
    });
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    const { cues, currentIndex, t } = latest.current;
    let target: ParsedCue | undefined;
    if (dir > 0) {
      target = cues[currentIndex + 1];
    } else {
      const cur = cues[currentIndex];
      const backIndex = Math.max(0, currentIndex - (t > (cur ? cur.t : 0) ? 0 : 1));
      target = cues[backIndex];
    }
    if (target) {
      setT(target.t);
      setSyncText(hms(target.t));
    }
  }, []);

  const jumpTo = useCallback((seconds: number) => {
    setT(seconds);
    setSyncText(hms(seconds));
  }, []);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const reset = useCallback(() => {
    setT(0);
    setPlaying(false);
    setSyncText("00:00:00");
    saveClockState({ t: 0 });
  }, []);

  const onSyncChange = useCallback((value: string) => {
    setSyncText(value);
    const parsed = secs(value);
    if (parsed !== null) setT(parsed);
  }, []);

  // Keyboard shortcuts, ignored while an input is focused.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea/i.test(target.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") nudge(5);
      else if (e.key === "ArrowLeft") nudge(-5);
      else if (e.key === "j" || e.key === "J") step(-1);
      else if (e.key === "k" || e.key === "K") step(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nudge, step]);

  const loadNewCueList = useCallback((list: CueList) => {
    setFilm(list.film);
    setRawCues(list.cues);
    saveCueList(list);
    setT(0);
    setPlaying(false);
    setSyncText("00:00:00");
    saveClockState({ t: 0 });
    lastIndexRef.current = null;
  }, []);

  const resetToDefaultCueList = useCallback(() => {
    clearCueList();
    setFilm(defaultList.film);
    setRawCues(defaultList.cues);
    setT(0);
    setPlaying(false);
    setSyncText("00:00:00");
    saveClockState({ t: 0 });
    lastIndexRef.current = null;
  }, [defaultList]);

  const current = currentIndex >= 0 ? cues[currentIndex] : null;
  const next = cues[currentIndex + 1] ?? null;
  const gap = next ? next.t - t : 0;
  const imminent = !!next && gap <= STANDBY_LEAD_SECONDS;

  return {
    film,
    cues,
    rawCueList: { film, runtime: defaultList.runtime, cues: rawCues } as CueList,
    t,
    clock: hms(t),
    playing,
    syncText,
    currentIndex,
    current,
    next,
    elapsed: current ? ms(t - current.t) : "0:00",
    countdown: next ? ms(gap) : "—",
    imminent,
    listRef,
    registerRow,
    scrollToNow,
    toggle,
    nudge,
    reset,
    step,
    jumpTo,
    onSyncChange,
    loadNewCueList,
    resetToDefaultCueList,
  };
}

export type CueRunner = ReturnType<typeof useCueRunner>;
