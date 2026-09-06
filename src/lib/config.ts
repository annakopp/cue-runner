// Tweakable behavior, per the design handoff's "Tweakable props" section.
export const STANDBY_LEAD_SECONDS = 30; // seconds before a cue at which NEXT flips to STANDBY (range 5-120)
export const AUTO_SCROLL = true;
export const STANDBY_COUNT = 3; // how many upcoming cues the NEXT/STANDBY strip shows
export const HIDE_ACTIVE_DEFAULT = true; // keep cues shown in the GO card / standby strip out of the list
export const CLOCK_STORAGE_KEY = "cuerunner.state";
export const CUES_STORAGE_KEY = "cuerunner.cues";
export const PREFS_STORAGE_KEY = "cuerunner.prefs";
