# Cue Runner

A single-operator cue-runner for a DIY "4DX" watch-along. It runs a timer synced to the film,
shows the cue firing **now**, counts down to the **next** cue, and keeps a scrollable timeline of
every cue — action, scene, prop items (with emoji), item category, and who's responsible.

Built for a dark room and a glance from across it: near-black surfaces, the action reads largest,
the countdown second.

React + TypeScript + Vite, no backend. The cue list is a JSON file bundled at build time and
synced from Notion (see below) — no server, no database.

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

```bash
npm run build   # production build to dist/
npm run lint    # oxlint
```

## Using it

- **RUN / HOLD** starts and stops the show clock. **SYNC TO FILM** sets the clock directly
  (`HH:MM:SS`) to line up with the film's own timestamp.
- **The minimap** under the transport is the whole show at a glance — one tick per cue, colored by
  category, dimmed once fired, with a playhead for where you are. Click anywhere on it to jump.
- **GO** (top card) is the cue that just fired. It holds for ten seconds — a gray bar along the
  bottom drains over that window so its going is something you see coming — then clears to a gray
  "waiting for next cue", so a stale instruction never sits there looking like something still to
  do. **DONE** on the card clears it the moment you've finished, without waiting the window out;
  it overrides the hold on extra-info cues too.
- The **JUST FIRED** row above it keeps the last cue on screen in gray to refer back to — one line,
  no props, long actions clipped with an ellipsis (hover for the full text). When a cue clears off
  the GO card it moves down into this row rather than vanishing.
- A cue can carry **extra info** — reference text you need in hand while it runs, like a speech to
  read aloud. It sits in a panel on the right of the GO card, with the prop blocks in the middle.
  The panel is always there (reading "none" when a cue has nothing) so the card doesn't reflow
  from cue to cue. **A cue with extra info ignores that clear** and stays up until the next cue
  takes over — you can't read from a panel that's already gone.
- The **NEXT UP / STANDBY** strip below it shows the next three cues with a countdown each (it
  flips to amber "STANDBY" inside the last 30 seconds). Those rows are clickable too, and a cue
  carrying extra info shows it there as a single clipped **NOTE** line — a standin who needs to be
  in position, say, is no use read at GO time. Full text on the card (and on hover).
- The cue list picks up where the standby strip leaves off — it's everything still to come *after*
  the three on standby, so nothing on screen is shown twice and the list is only ever the road
  ahead. The left column counts down to each cue; the absolute timecode sits in the right-hand
  **TC** column. Click any row to jump the clock to it.
- Every row on screen — JUST FIRED, the standby ones, the list — jumps the clock when clicked. To
  get further back than the last cue, scrub with the minimap, `←`/`→`, `J`/`K`, or SYNC TO FILM;
  the list itself doesn't carry past cues.
- Keyboard: `Space` run/hold, `←`/`→` ±5s, `J`/`K` previous/next cue.
- Your clock position is saved to this browser automatically, so a refresh mid-movie doesn't lose
  your place.
- It's built for one shared operator screen — a laptop or tablet, not a phone.

Tunables live in [`src/lib/config.ts`](src/lib/config.ts): `STANDBY_LEAD_SECONDS` (when NEXT UP
flips to STANDBY), `STANDBY_COUNT` (how many upcoming cues the strip shows, and therefore where
the list starts), `GO_LINGER_SECONDS` (how long a fired cue holds the GO card absent a DONE
press) and `AUTO_SCROLL`.

## Cue list format

The cue list is [`src/data/defaultCues.json`](src/data/defaultCues.json), bundled at build time.
Changing the show means editing that file (or re-syncing it from Notion, below) and pushing — the
app has no runtime import, so what's deployed is always what everyone sees.

```json
{
  "film": "The Fellowship of the Ring",
  "runtime": "02:58:00",
  "cues": [
    {
      "timestamp": "00:08:31",
      "action": "shake chair",
      "scene": "Frodo jumps in wagon",
      "item": "🪑 chair",
      "category": "furniture & fruit props",
      "who": "Matt"
    }
  ]
}
```

An optional `"extra"` string on any cue is reference text for the GO card's side panel — and it
also makes that cue hold the GO card until the next one fires, rather than clearing after
`GO_LINGER_SECONDS`. Line breaks in `action` and `extra` are preserved (runs of blank lines
collapse to one), so a cue made of several sub-actions reads as several lines.

Cues must be in chronological order by `timestamp`. Any of `action`, `scene`, `item`, `category`,
`who` may be blank — a blank `action` renders as a watch-only cue with no instruction.

For a cue whose items span more than one category (a single operator handling two different kinds
of props at once, say), add an explicit `groups` array — the flat `item`/`category`/`who` strings
can't otherwise say which items go with which category:

```json
{
  "timestamp": "02:33:10",
  "action": "Flash light motion continues. Turn on fan. Pull ring with magnet...",
  "scene": "Frodo sits on Amon Hen while wearing the ring.",
  "groups": [
    { "who": "Andrey", "category": "wind & fire", "items": ["🌬 small electric fan"] },
    { "who": "Matt", "category": "lighting", "items": ["🔦 color changing flashlight"] },
    { "who": "Anna Green", "category": "ring", "items": ["🧲 magnet", "💍 ring (magnetable)"] }
  ]
}
```

### Source of truth: Notion

`src/data/defaultCues.json` is the full, current export (135 cues) of the "🧝‍♀️ Scene Ideas"
Notion database, pulled via Notion MCP. That database's real shape is a bit richer than the flat
JSON above:

- Timestamp, action idea, and scene are direct columns.
- **Items** is a relation to a separate Items database (so item names are shared/reusable across
  cues, not retyped each time).
- Each Item in turn relates to an **Item Categories** database — that's where the category (and
  its color, in this app) actually comes from, *not* the cue-level "Caregory" select field on
  Scene Ideas (that one's a coarser food/effect/drink/ring/action/under-development tag used for
  Notion's own filtering and isn't used here).
- **Who's responsible is a property of the category, not the cue.** Each Item Category row has its
  own `User` person field — e.g. "wet & dark" is always the same person's job — and that's who
  shows up as the operator in this app. Scene Ideas' own `Name` column (who logged the idea) isn't
  used for this. A cue whose items span two categories gets two operators, one per category.
- Notion has no emoji field anywhere in this schema — the 🪑🧴✨ etc. are assigned per item name in
  the export step, not sourced from Notion. If you rename or add items, you're choosing their emoji
  too.

**To refresh from Notion**, ask Claude to re-sync using [`scripts/notion-sync/`](scripts/notion-sync/)
— that folder has the transform script, the two hand-maintained mapping files (item→emoji,
person id→name) and a runbook for the exact Notion queries. Once the raw exports are in place:

```bash
npm run sync:notion
```

regenerates `src/data/defaultCues.json`. Category colors are keyed by the exact category string,
lowercased — see [`src/lib/categoryColors.ts`](src/lib/categoryColors.ts) to add or change one.

## Deployment

This repo deploys itself to **GitHub Pages** on every push to `main` via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — no server, no build step to run
by hand. First time only: in the repo's **Settings → Pages**, set *Source* to **GitHub Actions**
(the workflow does the rest).

It's an equally good fit for **Vercel** if you'd rather have that — just import the repo at
vercel.com, it auto-detects Vite, no config needed (you'd want to drop the `base` path in
`vite.config.ts` back to `/` first, since Vercel serves from the domain root).

## Design source

[`design/`](design/) holds the original design handoff this was built from — the prototype HTML,
the design-direction exploration doc, and screenshots of the reference states. Not part of the
app; kept for reference.
