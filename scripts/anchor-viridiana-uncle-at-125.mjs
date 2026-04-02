/**
 * Remap viridiana.json times so the "Él te ha pedido…" cue (uncle / vows) starts at 125s (2:05)
 * while keeping order and relative spacing before/after the original pivot (first frame of that cue).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

function round2(x) {
  return Math.round(x * 100) / 100;
}

/** Original IA-aligned start of uncle cue in JSON before any nudge */
const PIVOT = 158.52;
const NEW_PIVOT = 125;
const OLD_MIN = 119.95;

function mapTime(t) {
  if (t <= PIVOT) {
    return OLD_MIN + ((t - OLD_MIN) / (PIVOT - OLD_MIN)) * (NEW_PIVOT - OLD_MIN);
  }
  return NEW_PIVOT + (t - PIVOT);
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
for (const c of data.cues) {
  const ns = mapTime(c.start);
  const ne = mapTime(c.end);
  c.start = round2(ns);
  c.end = round2(Math.max(ne, ns + 0.45));
}
for (let i = 1; i < data.cues.length; i++) {
  if (data.cues[i].start < data.cues[i - 1].end) {
    data.cues[i].start = round2(data.cues[i - 1].end + 0.04);
  }
}
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Anchored pivot", PIVOT, "→", NEW_PIVOT, "s");
