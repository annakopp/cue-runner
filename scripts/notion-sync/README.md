# Syncing the cue list from Notion

The cue data lives in the **🧝‍♀️ Scene Ideas** Notion database:
https://app.notion.com/p/27542e1197a780fc9c46c797b3a905ee?v=3ce42e1197a780869a23000c8c0bb310

This isn't an API script you can just run — it needs a Claude session with the Notion connection
active, because that's what can query Notion. What's checked in here is everything *except* that
live query: the transform logic, and the two hand-maintained mapping files that don't change often
(who's who, and which emoji goes with which prop). Next time the show list needs a refresh, tell
Claude:

> Re-sync the cue list from Notion using scripts/notion-sync/

and it should be able to follow this file mechanically. If you're doing it yourself with Claude's
help, here's what it needs to do:

## 1. Pull three raw exports from Notion

Using the Notion MCP `fetch`/`query_data_sources` tools, run these three queries and save each
result's `results` array verbatim to the matching file in this folder (overwrite what's there):

**`raw-scene-ideas.json`** — every cue row:
```sql
SELECT url, "Timestamp", "action idea", "scene", "Caregory", "Name", "Items"
FROM "collection://27542e11-97a7-8066-999d-000b743d031b"
```
(That data source ID is Scene Ideas' own ID — re-fetch the database URL above if Notion ever
changes it; `notion-fetch` on the database URL shows the current data source ID in a
`<data-source url="collection://...">` tag.) This may need `LIMIT 100 OFFSET 100` etc. to page
through — check `has_more` and keep paging; concatenate all pages into one array before saving.

**`raw-items.json`** — every prop, with its category link:
```sql
SELECT url, "Item", "Item Categories" FROM "collection://87c8f1b2-b028-4c6a-9900-abaafb4f710e"
```

**`raw-categories.json`** — the category names:
```sql
SELECT url, "Name" FROM "collection://3cf42e11-97a7-8062-a77d-000b288bea78"
```

If `query_data_sources` refuses a query (it can require a paid Notion plan for some modes), fetch
each data source with `notion-fetch` first to confirm the IDs haven't changed, then fall back to
single-data-source queries — that's what the app was actually built from.

Important: color-coding uses **Items → Item Categories** (the query above), *not* the "Caregory"
column that also lives on Scene Ideas rows — that one's a coarser tag used for Notion's own
filtering and isn't the taxonomy this app renders.

## 2. Check for new items or people

`raw-items.json` may contain item names not yet in [`item-emoji.json`](item-emoji.json) — Notion
has no emoji field, so every item's emoji is a manual choice recorded here. Likewise
`raw-scene-ideas.json`'s `Name` column may contain a person id not yet in
[`people.json`](people.json) — Notion's user-list API doesn't reliably return guests, so this
mapping was built from the database's per-person filtered views (fetch the database URL above and
read the `<view>` names/filters) rather than a users API call.

Add any new entries to those two files before running the build — running it anyway is fine too,
it'll fall back to a `•` placeholder / blank name and print exactly what's missing so you can fill
it in and re-run.

## 3. Run the build

```bash
node scripts/notion-sync/build-cues.mjs
```

This regenerates `src/data/defaultCues.json` — the app's bundled default cue list — from the three
raw exports plus the two mapping files. Then `npm run build` to confirm it compiles, spot-check a
few cues in the running app, and commit.
