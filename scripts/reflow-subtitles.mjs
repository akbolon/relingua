/**
 * Reflows subtitle cues: merge short lines, duration from phrase length,
 * silence gaps where no subtitle should show. Run: node scripts/reflow-subtitles.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public", "subtitles");

const files = [
  "viridiana.json",
  "ladri-di-biciclette.json",
  "rashomon.json",
  "pather-panchali.json",
  "seventh-seal.json",
];

const OFFSET = {
  "viridiana.json": 119,
  "ladri-di-biciclette.json": 57,
  "rashomon.json": 118,
  "pather-panchali.json": 245,
  "seventh-seal.json": 72,
};

function round2(x) {
  return Math.round(x * 100) / 100;
}

/** Merge consecutive cues when both are short (longer on-screen phrases). */
function mergeShortCues(cues) {
  const out = [];
  let i = 0;
  while (i < cues.length) {
    const a = cues[i];
    const next = cues[i + 1];
    if (
      next &&
      a.words.length <= 6 &&
      next.words.length <= 6 &&
      a.words.length + next.words.length <= 14
    ) {
      const joined = [...a.words, ...next.words]
        .map((w) => w.t)
        .join(" ");
      if (joined.length < 120) {
        out.push({ words: [...a.words, ...next.words] });
        i += 2;
        continue;
      }
    }
    out.push({ words: [...a.words] });
    i += 1;
  }
  return out;
}

function readDurationSec(words) {
  const n = words.length;
  const chars = words.map((w) => w.t).join(" ").length;
  // Longer phrases: more time; minimum for very short interjections
  const t = 2.4 + n * 0.48 + chars * 0.038;
  return Math.min(18, Math.max(2.6, t));
}

/** Gap after a cue (simulated silence / no dialogue). */
function silenceAfterCue(index) {
  if (index <= 0) return 0;
  // Stronger pause every 7th boundary (scene-ish), else medium, else short
  if (index % 7 === 0) return round2(4.5 + (index % 3) * 0.4);
  if (index % 3 === 0) return round2(1.85);
  return round2(0.85);
}

function reflowFile(file) {
  const p = path.join(pub, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const merged = mergeShortCues(data.cues);
  const offset = OFFSET[file] ?? 90;
  let t = offset;
  const cues = [];
  for (let i = 0; i < merged.length; i++) {
    const words = merged[i].words;
    const dur = readDurationSec(words);
    const gap = i === 0 ? 0 : silenceAfterCue(i);
    t += gap;
    const start = t;
    const end = t + dur;
    cues.push({
      start: round2(start),
      end: round2(end),
      words,
    });
    t = end;
  }
  data.cues = cues;
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(file, "cues:", cues.length, "ends ~", round2(t), "s");
}

for (const f of files) {
  reflowFile(f);
}
