# Cue Runner

A single-operator cue-runner for a DIY "4DX" watch-along. It runs a timer synced to the film,
shows the cue firing **now**, counts down to the **next** cue, and keeps a scrollable timeline of
every cue — action, scene, prop items (with emoji), item category, and who's responsible.

Built for a dark room and a glance from across it: near-black surfaces, the action reads largest,
the countdown second.

React + TypeScript + Vite, no backend. Cue data is a static JSON list you can load or export from
the app itself (see below) — no server, no database.

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
- **GO** (top card) is whatever cue just fired; the **NEXT / STANDBY** strip below it is what's
  coming and how soon (it flips to amber "STANDBY" inside the last 30 seconds).
- The cue list below that is the whole show — click any row to jump the clock to it.
- Keyboard: `Space` run/hold, `←`/`→` ±5s, `J`/`K` previous/next cue.
- Your clock position is saved to this browser automatically, so a refresh mid-movie doesn't lose
  your place.

## Cue list format

The cue list lives in a JSON file — either the one bundled with the app
([`src/data/defaultCues.json`](src/data/defaultCues.json)) or one you load at runtime via **LOAD
CUE LIST** in the footer. A loaded list is saved to this browser and persists across refreshes;
**EXPORT CUE LIST** downloads whatever list is currently active, so you can edit it and reload it,
or keep it as a backup.

```json
{
  "film": "The Fellowship of the Ring",
  "runtime": "02:58:00",
  "cues": [
    {
      "timestamp": "00:08:45",
      "action": "shake chair",
      "scene": "Frodo jumps in wagon",
      "item": "🪑 chair",
      "category": "furniture",
      "who": "Matt"
    }
  ]
}
```

Cues must be in chronological order by `timestamp`. Any of `action`, `scene`, `item`, `category`,
`who` may be blank — a blank `action` renders as a watch-only cue with no instruction.

For a cue whose items span more than one category (a single operator handling two different kinds
of props at once, say), add an explicit `groups` array — the flat `item`/`category`/`who` strings
can't otherwise say which items go with which category:

```json
{
  "timestamp": "02:33:10",
  "action": "Strobe light continues. Turn on fan. Pull ring with magnet...",
  "scene": "Frodo sits on Amon Hen while wearing the ring.",
  "groups": [
    { "who": "Matt", "category": "lighting, fire and wind", "items": ["🌬 small electric fan", "🔦 color changing flashlight"] },
    { "who": "Matt", "category": "ring", "items": ["🧲 magnet", "💍 ring (magnetable)"] }
  ]
}
```

### Source of truth: Notion

`src/data/defaultCues.json` is the full, current export (125 cues) of the "🧝‍♀️ Scene Ideas"
Notion database, pulled via Notion MCP. That database's real shape is a bit richer than the flat
JSON above:

- Timestamp, action idea, and scene are direct columns.
- **Items** is a relation to a separate Items database (so item names are shared/reusable across
  cues, not retyped each time).
- Each Item in turn relates to an **Item Categories** database — that's where the category (and
  its color, in this app) actually comes from, *not* the cue-level "Caregory" select field on
  Scene Ideas (that one's a coarser food/effect/drink/ring/action/under-development tag used for
  Notion's own filtering and isn't used here).
- **Name** is a real Notion person property, resolved to a display name.
- Notion has no emoji field anywhere in this schema — the 🪑🧴✨ etc. are assigned per item name in
  the export step, not sourced from Notion. If you rename or add items, you're choosing their emoji
  too.

To refresh from Notion: re-run the same query/export shape (Scene Ideas rows joined against Items
and Item Categories, person IDs resolved to names, sorted by timestamp, multi-category cues turned
into `groups`) and either replace `src/data/defaultCues.json` or load the result via **LOAD CUE
LIST** at runtime. Category colors are keyed by the exact category string, lowercased — see
[`src/lib/categoryColors.ts`](src/lib/categoryColors.ts) to add or change one.

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
