#!/usr/bin/env node
// Turns a raw Notion export of the "Scene Ideas" database into the app's cues.json shape.
// See scripts/notion-sync/README.md for how to produce the three raw-*.json inputs this reads.
//
// Usage: node scripts/notion-sync/build-cues.mjs
// Reads:  scripts/notion-sync/raw-scene-ideas.json, raw-items.json, raw-categories.json
// Writes: src/data/defaultCues.json

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL(".", import.meta.url));
const read = (name) => JSON.parse(readFileSync(dir + name, "utf8"));

const sceneIdeas = read("raw-scene-ideas.json");
const rawItems = read("raw-items.json");
const rawCategories = read("raw-categories.json");
const people = read("people.json");
const itemEmoji = read("item-emoji.json");

const FILM = "The Fellowship of the Ring";
const RUNTIME = "02:58:00";

function pad(n) {
  return String(n).padStart(2, "0");
}
function secsOf(ts) {
  const p = String(ts).split(":").map((n) => parseInt(n, 10));
  return p.length === 3 && p.every((n) => !isNaN(n)) ? p[0] * 3600 + p[1] * 60 + p[2] : 0;
}
function hms(t) {
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
}

// category page url -> category name (e.g. "food & drink")
const categoryNameByUrl = new Map(rawCategories.map((c) => [c.url, c.Name]));

const missingPeople = new Set();
function resolvePerson(nameJson) {
  const ids = nameJson ? JSON.parse(nameJson) : [];
  if (!ids.length) return "";
  const resolved = people[ids[0]];
  if (!resolved) missingPeople.add(ids[0]);
  return resolved ?? "";
}

// category name -> operator display name. The operator is the person assigned to a *category*
// in the Item Categories table (who handles all "wet" effects, say) — not anything on the cue
// row itself, which just records who logged the idea.
const categoryOperator = new Map(rawCategories.map((c) => [c.Name, resolvePerson(c.User)]));

// item page url -> { name, category }
const itemByUrl = new Map();
const missingEmoji = new Set();
for (const it of rawItems) {
  const catUrls = it["Item Categories"] ? JSON.parse(it["Item Categories"]) : [];
  const category = categoryNameByUrl.get(catUrls[0]) ?? "";
  const name = it.Item;
  const key = name.trim().toLowerCase();
  const emoji = itemEmoji[key];
  if (!emoji) missingEmoji.add(name);
  itemByUrl.set(it.url, { name, category, emoji: emoji ?? "•" });
}

const cues = sceneIdeas.map((row) => {
  const t = secsOf(row.Timestamp);
  const itemUrls = row.Items ? JSON.parse(row.Items) : [];
  const resolved = itemUrls.map((u) => itemByUrl.get(u) ?? { name: u, category: "", emoji: "•" });
  const categoriesPresent = [...new Set(resolved.map((r) => r.category))];

  const base = {
    timestamp: hms(t),
    action: row["action idea"] || "",
    scene: row.scene || "",
  };

  if (categoriesPresent.length <= 1) {
    const cat = categoriesPresent[0] || "";
    return {
      ...base,
      item: resolved.map((r) => `${r.emoji} ${r.name}`).join(", "),
      category: cat,
      who: categoryOperator.get(cat) ?? "",
    };
  }

  return {
    ...base,
    item: resolved.map((r) => `${r.emoji} ${r.name}`).join(", "),
    category: categoriesPresent.join(" · "),
    who: categoriesPresent.map((cat) => categoryOperator.get(cat) ?? "").join(" · "),
    groups: categoriesPresent.map((cat) => ({
      who: categoryOperator.get(cat) ?? "",
      category: cat,
      items: resolved.filter((r) => r.category === cat).map((r) => `${r.emoji} ${r.name}`),
    })),
  };
});

cues.sort((a, b) => secsOf(a.timestamp) - secsOf(b.timestamp));

const out = { film: FILM, runtime: RUNTIME, cues };
writeFileSync(dir + "../../src/data/defaultCues.json", JSON.stringify(out, null, 2) + "\n");

console.log(`Wrote ${cues.length} cues to src/data/defaultCues.json`);
if (missingEmoji.size) {
  console.warn(
    `\nNo emoji on file for ${missingEmoji.size} item(s) — add them to scripts/notion-sync/item-emoji.json and re-run:`,
  );
  for (const name of missingEmoji) console.warn(`  "${name.toLowerCase()}": "",`);
}
if (missingPeople.size) {
  console.warn(
    `\nNo display name on file for ${missingPeople.size} person id(s) — add them to scripts/notion-sync/people.json and re-run:`,
  );
  for (const id of missingPeople) console.warn(`  "${id}": "",`);
}
