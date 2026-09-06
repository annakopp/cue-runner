// Tweakable behavior, per the design handoff's "Tweakable props" section.
export const STANDBY_LEAD_SECONDS = 30; // seconds before a cue at which NEXT flips to STANDBY (range 5-120)
export const AUTO_SCROLL = true;
export const STANDBY_COUNT = 3; // how many upcoming cues the NEXT/STANDBY strip shows
export const GO_LINGER_SECONDS = 6; // how long a fired cue holds the GO card before it clears
export const CLOCK_STORAGE_KEY = "cuerunner.state";
export const CUES_STORAGE_KEY = "cuerunner.cues";
