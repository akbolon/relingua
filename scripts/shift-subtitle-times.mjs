/**
 * Shifts every cue start/end by DELTA seconds (can be negative).
 * Usage: node scripts/shift-subtitle-times.mjs <delta> <public/subtitles/file.json>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const delta = Number(process.argv[2]);
const rel = process.argv[3];
if (!rel || !Number.isFinite(delta)) {
  console.error("Usage: node scripts/shift-subtitle-times.mjs <deltaSeconds> <path-to-json>");
  process.exit(1);
}
const p = path.isAbsolute(rel) ? rel : path.join(__dirname, "..", rel);
const data = JSON.parse(fs.readFileSync(p, "utf8"));
function round2(x) {
  return Math.round(x * 100) / 100;
}
for (const c of data.cues) {
  c.start = round2(c.start + delta);
  c.end = round2(c.end + delta);
}
fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Shifted", data.cues.length, "cues by", delta, "→", p);
