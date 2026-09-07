// Tweakable behavior, per the design handoff's "Tweakable props" section.
export const STANDBY_LEAD_SECONDS = 30; // seconds before a cue at which NEXT flips to STANDBY (range 5-120)
export const AUTO_SCROLL = true;
export const STANDBY_COUNT = 3; // how many upcoming cues the NEXT/STANDBY strip shows
// How long a fired cue holds the GO card before it clears. Cues carrying extra info are exempt —
// they hold until the next cue takes over, since that text is there to be read from.
export const GO_LINGER_SECONDS = 6;
export const CLOCK_STORAGE_KEY = "cuerunner.state";
