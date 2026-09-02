# Handoff: Cue Runner (DIY 4DX cue sheet)

## Overview
A single-operator cue-runner for a DIY "4DX" watch-along of *The Fellowship of the Ring*. It runs a
timer synced to the film, shows the cue that is firing **now**, counts down to the **next** cue, and
keeps a scrollable timeline of every cue. Each cue names a physical action ("shake chair"), the scene
on screen for context, the prop item(s) with their emoji, the item category, and who is responsible.

Design constraints that drove every decision:
- **Used in a dark room during a movie.** Near-black surfaces, no large light-coloured fills, no white.
- **Glanceable at a distance.** The action is the largest type on screen; the countdown is second.
- **Must hold both extremes.** Cues range from a two-word action with no scene/item/owner to a
  full-sentence action with 4 items, 2 categories and 2 people.

## Source of truth for cue data
The cues live in a Notion table (view link):
https://app.notion.com/p/27542e1197a780fc9c46c797b3a905ee?v=3ce42e1197a780869a23000c8c0bb310&source=copy_link

That table's columns map 1:1 to the fields below (timestamp, action, scene, item, item category, who's on
it). `cues.json` in this bundle is a static export of it, and the same array is embedded in the prototype
so it renders with no server. Re-export from Notion to refresh; the emoji live in the item column there.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the
intended look and behaviour, not production code to copy. The task is to **recreate this design in the
target codebase's existing environment** (React, Vue, Svelte, SwiftUI, native, …) using its established
patterns, component library and state conventions. If no environment exists yet, pick the framework
that best fits the project and implement the design there.

The prototype is written as a single self-contained HTML file with a small logic class; its structure is
a reasonable guide to component boundaries but is not idiomatic for any particular framework.

## Fidelity
**High-fidelity.** Colors, typography, spacing, states and interactions are final. Recreate pixel-close
using the codebase's own primitives. The only intentionally unfinished parts are noted under *Open items*.

---

## Screens / Views

There is **one screen**, a full-viewport (100vh) vertical stack that never page-scrolls. Only the cue
list scrolls. Top to bottom: Transport → GO card → NEXT/STANDBY strip → Cue list → Footer.

Root container: `height:100vh; display:flex; flex-direction:column; overflow:hidden;`
background `#0c0d0e`, text `#b9b3a8`, font `IBM Plex Mono`.

### 1. Transport bar (fixed height, `flex:none`)
Purpose: start/stop and align the clock to the film.

Layout: single flex row, `align-items:center; gap:22px;`
padding `clamp(8px,1.5vh,16px) 26px`, bottom border `1px solid #23262a`.

| Element | Spec |
|---|---|
| "SHOW TIME" label | 10px, letter-spacing .24em, `#6b7076`, 6px below-margin |
| Clock `HH:MM:SS` | `clamp(26px,4vh,38px)`, weight 600, `#e8e3d6`, line-height 1, `font-variant-numeric:tabular-nums` |
| −5s / +5s / RESET | 13px, `1px solid #2e3237`, padding 11px 14px, text `#b9b3a8` (RESET `#8a8378`); hover border `#5c6167`, text `#e8e3d6` |
| RUN / HOLD | 13px, letter-spacing .16em, text `#e8e3d6`, padding 11px 24px, glyph ▶ / ❚❚ at 12px, gap 9px. Background `oklch(0.4 0.1 145)` when stopped (green = press to run), `oklch(0.42 0.13 25)` when running (red = press to hold). Hover `filter:brightness(1.25)` |
| Film title block | Archivo Narrow 14px, letter-spacing .2em, uppercase, `#4e5359`; second line "prompt book · N cues" in `#3f4348`; right-aligned, pushed right by a `flex:1` spacer |
| "SYNC TO FILM" input | label as above; input width 132px, bg `#131517`, `1px solid #2e3237`, text `#e8e3d6`, 18px, padding 7px 10px, centred, letter-spacing .06em. Focus: border `#5c6167`, no outline. Accepts `HH:MM:SS`; sets the clock on every valid keystroke |

### 2. GO card — "running now" (`flex:none`)
Purpose: the one thing to do right now, readable across the room.

Background `#101112`, padding `clamp(10px,2vh,22px) 26px`, bottom border `1px solid #23262a`.

Header row (flex, gap 12px, align-items center):
- `GO — RUNNING NOW` — 10px, letter-spacing .22em, `oklch(0.75 0.16 145)` (green)
- cue timestamp — 12px `#8a8378`
- `+M:SS` elapsed since the cue fired — 12px, green

Body: `display:grid; grid-template-columns:1fr auto; gap:32px; align-items:start; margin-top:clamp(6px,1.4vh,14px)`

Left column (the cue):
- **Scene** — Archivo Narrow `clamp(15px,2.3vh,21px)`, weight 500, letter-spacing .04em,
  `oklch(0.82 0.09 65)` (amber), `min-height:20px` so the card doesn't jump when scene is blank.
  Sits **above** the action — scene is context, action is the instruction.
- **Action** — Archivo Narrow, weight 600, line-height 1.04, `#e8e3d6`, `text-wrap:pretty`,
  size `clamp(26px,4.6vh,52px)`, dropping to `clamp(22px,3.4vh,38px)` when the action string is
  longer than 70 characters. Blank action renders as "watch only — no action".

Right column (who holds what) — `min-width:270px; max-width:400px`, vertical stack, gap 9px.
**One block per person**, because in the source data a person owns an item *category*:
- block: bg `#1c1f21`, `1px solid #3a3f45`
- header: padding 9px 14px, bottom border `1px solid #3a3f45`, flex gap 9px —
  category dot (8px circle, category colour) · person name (Archivo Narrow 21px/700 `#e8e3d6`) ·
  category (10px, letter-spacing .14em, `#7d858c`, uppercase)
- items: flex wrap, gap 8px, padding 11px 14px; each item chip bg `#262a2d`, padding 6px 12px 6px 9px,
  emoji 23px + name Archivo Narrow 18px/600 `#e8e3d6`

Empty state (clock before the first cue): "NO CUE YET" 10px `#5c6167` + "first cue at HH:MM:SS —
hit RUN when the film starts", Archivo Narrow 26px `#4e5359`.

### 3. NEXT / STANDBY strip (`flex:none`)
Purpose: how long until the next thing, and what it is — same columns as the list so the eye tracks straight down.

Two modes, switched by the `standbyLead` threshold (default 30s to the next cue):
| | NEXT (far) | STANDBY (imminent) |
|---|---|---|
| label | "NEXT" | "STANDBY — COMING UP" |
| label + countdown colour | `#8a8378` | `oklch(0.86 0.11 75)` (amber) |
| background | `#0e0f10` | `oklch(0.62 0.12 60 / 0.1)` |

Grid `104px 1fr 300px`, gap 18px, padding `6px 26px clamp(9px,1.6vh,16px)`, align-items start —
**identical columns to the cue list below**.
- col 1: "IN" 13px letter-spacing .16em `#8a8378`, then countdown `clamp(24px,3.8vh,34px)`/600,
  tabular-nums. (Deliberately *not* the absolute timestamp — time-to-cue is what the operator needs.)
- col 2: scene 13px `#8a8378` above action 18px/500 `#e8e3d6`, `text-wrap:pretty`
- col 3: per-person groups — dot (7px) + "NAME · CATEGORY" 12px `#8a8378`, then items as
  emoji (19px) + name (15px) pairs, flex wrap, gap `6px 14px`

### 4. Cue list (`flex:1 1 auto; min-height:0; overflow-y:auto`)
Purpose: the whole show at a glance; past above, upcoming below.

Sticky header row: `position:sticky; top:0; z-index:2`, same grid, padding 10px 26px,
10px labels letter-spacing .2em `#5c6167` — `TC` / `SCENE · CUE` / `WHO · ITEMS` (last two `#8a8378`),
background `#0c0d0e` so rows slide under it.

Row: same grid `104px 1fr 300px`, gap 18px, padding `14px 26px 14px 23px`,
bottom border `1px solid #1a1d1f`, `border-left:3px solid transparent`, `cursor:pointer`,
hover background `#131517`. Clicking a row sets the clock to that cue's timestamp.

Row states:
| state | text | scene/dim text | dots | background | left bar |
|---|---|---|---|---|---|
| past | `#4e5359` | `#3f4348` | opacity .45 | transparent | transparent |
| **now** | `#e8e3d6`, weight 600 | `#6b7076` | 1 | `oklch(0.75 0.16 145 / 0.09)` | `3px solid oklch(0.75 0.16 145)` |
| upcoming | `#b9b3a8` | `#6b7076` | 1 | transparent | transparent |

Cell contents: timestamp (tabular-nums) · scene 13px above action 16px (`font-style:italic` +
"watch only" when the action is blank) · per-person groups exactly as in the STANDBY strip.
A 120px spacer div after the last row so the final cue can scroll clear of the footer.

### 5. Footer (`flex:none`)
Padding `clamp(7px,1.2vh,12px) 26px`, top border `1px solid #23262a`, 11px letter-spacing .14em `#5c6167`.
- `JUMP TO NOW` button — `1px solid #2e3237`, padding 8px 14px, `#8a8378`, hover `#e8e3d6`/`#5c6167`
- right-aligned shortcut legend: `SPACE RUN/HOLD · ←→ ±5s · J/K PREV/NEXT CUE · CLICK A ROW TO JUMP`

---

## Interactions & Behavior
- **RUN/HOLD** toggles a 1s-interval clock. The clock is authoritative; everything else derives from it.
- **±5s / RESET** clamp at 0. Every clock mutation also rewrites the sync input's text.
- **Sync input** parses `HH:MM:SS` on change; invalid text is kept in the field but doesn't move the clock.
- **Keyboard** (window-level, ignored while an input is focused): `Space` run/hold (preventDefault),
  `←`/`→` ∓5s, `J`/`K` jump to previous/next cue.
- **GO = the last cue whose timestamp ≤ clock. NEXT = the following cue.** No cue is ever "skipped";
  scrubbing backwards re-derives both.
- **Auto-scroll**: when the current cue index changes, the list scrolls so that row sits ~90px below the
  container top. Implemented as a direct `scrollTop` assignment using
  `row.getBoundingClientRect().top − container.getBoundingClientRect().top` (an `offsetTop` version is
  wrong here because the container isn't the offset parent). Suppressed when `autoScroll` is off.
- **JUMP TO NOW** runs the same routine on demand.
- **Persistence**: clock position is written to `localStorage` every 3s and on unmount, and restored on
  load, so a refresh mid-movie doesn't lose your place.
- No hover state on the GO card or STANDBY strip — they are read, not clicked.

## State Management
```
t            number   clock position in seconds (single source of truth)
playing      boolean  timer running
syncText     string   raw text in the sync field (decoupled from t so typing is possible)
cues         Cue[]    parsed cue data
loaded       boolean  cue fetch finished (distinguishes "no cues" from "not loaded")
```
Derived per render, not stored: `currentIndex` (last cue with `t <= clock`), `go`, `next`,
`countdown`, `elapsed`, and the row view-models with their state colours.

Data fetching: one GET of `cues.json` on mount; on failure the UI shows the empty state rather than
erroring. There is no write path — cue data is a static export.

## Data model & parsing
Source is a static export of a Notion table; each row's fields are loose strings:
```json
{ "timestamp": "02:33:10",
  "action": "strobe + fan + orange light + magnet-pull ring …",
  "scene": "Frodo sits on Amon Hen wearing the ring",
  "item": "🌬 small electric fan, 🔦 color changing flashlight, 🧲 magnet, 💍 ring (magnetable)",
  "category": "lighting, fire and wind/ring",
  "who": "Andrey/Anna Green" }
```
Parsing rules implemented in the prototype:
- `item` splits on `,`; each item's leading emoji is separated from its name with
  `/^(\p{Extended_Pictographic}[\uFE0F\u200D\p{Extended_Pictographic}]*)\s*(.*)$/u` so the emoji can be
  rendered as its own visual tag. Fallback glyph `•`.
- `category` and `who` split on `/`.
- Grouping: one group per person, carrying that person's category and items.
  - If the row supplies an explicit `groups: [{who, category, items[]}]` array, use it (needed whenever
    a cue has several people, since the flat strings don't say which item belongs to whom).
  - Else if `who` and `category` have equal length > 1, zip them.
  - Else one group with all items, `who` joined by " · ", falling back to "unassigned".
- Any of `action`, `scene`, `item`, `category`, `who` may be blank; all four blank-cases are designed for.

**Recommendation for production:** normalise this at the source instead — give each cue
`assignments: [{ person, category, items: [{emoji, name}] }]` and stop string-splitting at runtime.

## Design Tokens
Colors
```
--bg-page        #0c0d0e   page, sticky header
--bg-card        #101112   GO card
--bg-strip       #0e0f10   NEXT strip (calm state)
--bg-block       #1c1f21   person block
--bg-chip        #262a2d   item chip
--bg-input       #131517   input
--bg-row-hover   #131517
--border         #23262a   section rules
--border-row     #1a1d1f   row rules
--border-ctl     #2e3237   buttons, inputs
--border-ctl-hi  #5c6167   hover
--border-block   #3a3f45   person block
--text-hi        #e8e3d6   primary
--text           #b9b3a8   body
--text-mid       #8a8378   secondary
--text-dim       #6b7076   labels
--text-faint     #5c6167   legend
--text-past      #4e5359   fired rows
--text-past-dim  #3f4348
--go             oklch(0.75 0.16 145)   green: running now, current row bar
--standby        oklch(0.86 0.11 75)    amber: imminent countdown
--scene          oklch(0.82 0.09 65)    amber: scene line on GO card
--hold           oklch(0.42 0.13 25)    red: HOLD button
--run            oklch(0.4 0.1 145)     green: RUN button
```
Category colours (the peripheral code — learn once, read at a glance)
```
wet                      oklch(0.72 0.11 235)
lighting, fire and wind  oklch(0.82 0.12 75)
fighting                 oklch(0.7 0.16 25)
human                    oklch(0.72 0.12 340)
misc                     oklch(0.7 0.02 250)
food & drink             oklch(0.75 0.13 140)
ring                     oklch(0.72 0.13 300)
furniture                oklch(0.72 0.1 195)
```
Typography — `IBM Plex Mono` 400/500/600/700 for data, timestamps, labels, UI;
`Archivo Narrow` 500/600/700 for the action, person names and item names (it sets wide and short, which
is what makes the action readable at distance). Scale: 10px labels (letter-spacing .2–.24em, uppercase) ·
12–13px meta · 14–16px row body · 18–21px secondary action / names · 24–38px countdown & clock ·
26–52px GO action.

Spacing: 26px page gutter · 18px column gap · 32px GO card column gap · 14px row padding · 8–9px chip gaps.
Borders 1px, left state bar 3px. Radius: **0 everywhere** except the two 7–8px category dots — the
squared-off look is deliberate (a stage manager's cue sheet, not a consumer app).

Responsive: no breakpoints, but all vertical chrome (paddings, clock, scene, GO action, countdown) is
`clamp(min, Nvh, max)` so on a short window the fixed chrome shrinks and the scrollable list keeps its
rows. The list must stay `flex:1 1 auto; min-height:0` for this to hold.
Two implementation gotchas found the hard way: `scroll-behavior:smooth` on the list container made
programmatic `scrollTop` assignment a no-op in the preview webview (dropped it), and the scroll
container must be resolved by attribute/ref that actually binds, not `offsetTop` maths.

## Assets
None. No images, no icon set, no SVG. Every icon in the UI is an **emoji supplied by the cue data**
(the prop's own emoji from the Notion table) plus one CSS circle for the category dot. Two Google Fonts:
IBM Plex Mono, Archivo Narrow.

## Open items
- The emoji for **woodsy perfume 🧴, sparkler ✨ and pool noodle 〰️** are placeholders — replace with the
  real values from the Notion DB.
- `cues.json` / the embedded array is a partial cue list (14 cues) assembled from the sample rows and the
  current app's timeline; re-export the full table from Notion.
- Cue editing (add/edit/delete, assign items and people) is **not** designed yet — the prototype is
  read-only against a static export.
- No per-person filtered view; the design assumes one shared screen.
- Categories `misc` and `human` have colours assigned but no strong semantic; revisit if they get common.

## Screenshots
`screenshots/` shows the four states that matter:
1. `01` — blank-action cue (00:22:38): scene carries the row, action reads "watch only — no action"
2. `02` — simple cue (00:44:45 carrot snack): one item, one owner, no scene
3. `03` — dense cue (02:33:10 Amon Hen): long action at reduced type size, two people, two categories, four items
4. `04` — timer running (HOLD state, red transport)

## Files
```
Cue Runner.dc.html            the prototype — single screen, full behaviour (design reference)
cues.json                     static cue data it reads on load
Cue Runner Directions.dc.html exploration doc: three visual directions (prompt book / storybook /
                              ranger's instrument) plus the iterations that produced the final design.
                              Useful for understanding what was rejected and why.
```
Both `.dc.html` files open directly in a browser with no server — the cue array is embedded in
`Cue Runner.dc.html`. If `cues.json` is servable it overrides the embedded copy, so a static server lets
you edit data without touching the HTML. `support.js` is the prototype's tiny runtime; it is not part of
the design and should not be ported.

## Tweakable props (worth preserving as config)
- `standbyLead` — seconds before a cue at which NEXT flips to STANDBY. Default 30, range 5–120.
- `autoScroll` — auto-scroll the list to the current cue. Default true.
