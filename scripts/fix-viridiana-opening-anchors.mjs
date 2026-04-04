/**
 * Pin Viridiana opening to Internet Archive encode + English burned-in subs:
 *   2:00 — Sister Viridiana (Hermana Viridiana)
 *   ~2:02–2:05 — letter from uncle
 *   2:05 — vows / profession line (He won't be able to come when you take your vows)
 *   2:11 — Está bien, Madre
 * Then shift all later cues to preserve inter-cue gaps after cue 4 (vs. pre-fix JSON).
 *
 * Run: node scripts/fix-viridiana-opening-anchors.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

function round2(x) {
  return Math.round(x * 100) / 100;
}

const OPENING = [
  [120, 121.02],
  [121.06, 122.12],
  [122.2, 124.98],
  [125, 130.95],
  [131, 132.12],
];

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const cues = data.cues;

const oldCue4End = cues[4].end;
const oldCue5Start = cues[5].start;
const newCue4End = OPENING[4][1];
const newCue5Start = newCue4End + (oldCue5Start - oldCue4End);
const shift = round2(newCue5Start - oldCue5Start);

for (let i = 0; i < 5; i++) {
  cues[i].start = OPENING[i][0];
  cues[i].end = OPENING[i][1];
}

for (let i = 5; i < cues.length; i++) {
  cues[i].start = round2(cues[i].start + shift);
  cues[i].end = round2(cues[i].end + shift);
}

for (let i = 1; i < cues.length; i++) {
  if (cues[i].start < cues[i - 1].end - 0.02) {
    cues[i].start = round2(cues[i - 1].end + 0.05);
  }
  if (cues[i].end <= cues[i].start) {
    cues[i].end = round2(cues[i].start + 0.5);
  }
}

data.scriptSource =
  "Spanish: OpenAI Whisper (base) on IA Viridiana.mp4; English glosses Script Savant where keyed. " +
  "Opening pinned to IA wall clock / English burned-in: Hermana Viridiana 2:00; letter ~122.2–125s; " +
  "vows line from 2:05 (125s); Está bien, Madre from 2:11 (131s). " +
  "Tail shifted to preserve inter-cue gaps from cue 6 onward. Run: node scripts/fix-viridiana-opening-anchors.mjs; " +
  "OCR sync skips first 5 cues (see sync-burned-in-ocr.mjs).";

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Opening pinned; tail shift", shift, "s");
console.log("cues 0–5:", cues.slice(0, 6).map((c) => [c.start, c.end]));
