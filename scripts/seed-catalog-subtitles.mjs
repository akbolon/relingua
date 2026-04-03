/**
 * Generates timed subtitle JSON (opening scenes) for catalog titles.
 * Only non-English dialogue films belong in the catalog (English glosses target L1 English learners).
 * Run from repo root: node scripts/seed-catalog-subtitles.mjs
 *
 * `offset` anchors the first cue to IA audio (silencedetect / wall-clock check, 2026-04).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public", "subtitles");

function round2(x) {
  return Math.round(x * 100) / 100;
}

function silenceAfterCue(index) {
  if (index <= 0) return 0;
  if (index % 7 === 0) return round2(4.2 + (index % 3) * 0.35);
  if (index % 3 === 0) return round2(1.55);
  return round2(0.75);
}

function readDurationSec(words) {
  const n = words.length;
  const chars = words.map((w) => w.t).join(" ").length;
  const t = 2.2 + n * 0.42 + chars * 0.034;
  return Math.min(16, Math.max(2.4, t));
}

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

function buildFile(locale, offset, rawCues) {
  const merged = mergeShortCues(rawCues);
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
  return { locale, cues };
}

/** Each entry: raw cue lines (split into words with en gloss). */
const DATA = {
  "m-1931.json": {
    locale: "de",
    offset: 37,
    lines: [
      [
        ["Warte", "Wait"],
        ["—", "—"],
        ["hallo,", "hello,"],
        ["was", "what"],
        ["ist", "is"],
        ["denn", "then"],
        ["das?", "that?"],
      ],
      [
        ["Ich", "I"],
        ["habe", "have"],
        ["keine", "no"],
        ["Zeit.", "time."],
      ],
      [
        ["Alle", "Everyone"],
        ["sucht", "is looking for"],
        ["den", "the"],
        ["Mörder.", "murderer."],
      ],
      [
        ["Wer", "Who"],
        ["ist", "is"],
        ["der", "the"],
        ["Mann", "man"],
        ["mit", "with"],
        ["der", "the"],
        ["Pfeife?", "whistle?"],
      ],
      [
        ["Ruhe", "Quiet"],
        ["bitte!", "please!"],
      ],
      [
        ["Die", "The"],
        ["Polizei", "police"],
        ["ist", "is"],
        ["überall.", "everywhere."],
      ],
    ],
  },
  "the-blue-angel.json": {
    locale: "de",
    offset: 90,
    lines: [
      [
        ["Herr", "Mr."],
        ["Professor,", "Professor,"],
        ["guten", "good"],
        ["Tag.", "day."],
      ],
      [
        ["Die", "The"],
        ["Studenten", "students"],
        ["warten", "are waiting"],
        ["schon.", "already."],
      ],
      [
        ["Lola,", "Lola,"],
        ["singen", "sing"],
        ["Sie", "—"],
        ["heute", "today"],
        ["Abend?", "evening?"],
      ],
      [
        ["Natürlich,", "Of course,"],
        ["meine", "my"],
        ["Herren.", "gentlemen."],
      ],
      [
        ["Das", "That"],
        ["ist", "is"],
        ["ein", "a"],
        ["wunderbarer", "wonderful"],
        ["Abend.", "evening."],
      ],
    ],
  },
};

for (const [filename, spec] of Object.entries(DATA)) {
  const rawCues = spec.lines.map((line) => ({
    words: line.map(([t, en]) => ({ t, en })),
  }));
  const out = buildFile(spec.locale, spec.offset, rawCues);
  const p = path.join(pub, filename);
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + "\n", "utf8");
  const last = out.cues[out.cues.length - 1];
  console.log(filename, "cues:", out.cues.length, "ends ~", last.end);
}
