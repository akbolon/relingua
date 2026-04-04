/**
 * Re-times public/subtitles/*.json cues by OCR of burned-in English subtitles in the IA MP4.
 * Samples the bottom ~38% of the frame (typical hardcoded sub band), runs Tesseract (eng),
 * and scores OCR vs. each cue's English gloss with token overlap (English keyword match).
 * Only start/end change. Viridiana: first 5 cues stay hand-pinned to IA wall clock (opening).
 *
 * Prereqs: ffmpeg in PATH, npm i (tesseract.js).
 * Usage:
 *   node scripts/sync-burned-in-ocr.mjs viridiana
 *   node scripts/sync-burned-in-ocr.mjs all
 *   node scripts/sync-burned-in-ocr.mjs rashomon --max-cues 8
 */
import { createWorker } from "tesseract.js";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** Viridiana: first cues are wall-clock–pinned to IA English subs (see fix-viridiana-opening-anchors.mjs). */
const SKIP_OCR_CUE_COUNT = { viridiana: 5 };

const CATALOG = [
  {
    id: "viridiana",
    videoUrl: "https://archive.org/download/viridiana_202108/Viridiana.mp4",
    json: "public/subtitles/viridiana.json",
  },
  {
    id: "ladri-di-biciclette",
    videoUrl:
      "https://archive.org/download/ladri-di-biciclette-vittorio-de-sica-1948-b-n-720p/LADRI%20DI%20BICICLETTE%20%28Vittorio%20De%20Sica%2C%201948%20-%20b_n%20720p%29.mp4",
    json: "public/subtitles/ladri-di-biciclette.json",
  },
  {
    id: "rashomon",
    videoUrl: "https://archive.org/download/rashomon-1950_202408/Rashomon_1950.mp4",
    json: "public/subtitles/rashomon.json",
  },
  {
    id: "pather-panchali",
    videoUrl:
      "https://archive.org/download/pather-panchali-1955_202601/Pather%20Panchali%20%281955%29.mp4",
    json: "public/subtitles/pather-panchali.json",
  },
  {
    id: "det-sjunde-inseglet",
    videoUrl: "https://archive.org/download/det-sjunde-inseglet/Det%20sjunde%20inseglet.mp4",
    json: "public/subtitles/seventh-seal.json",
  },
  {
    id: "m-1931",
    videoUrl: "https://archive.org/download/1931-m/1931%20M.mp4",
    json: "public/subtitles/m-1931.json",
  },
  {
    id: "the-blue-angel",
    videoUrl:
      "https://archive.org/download/the-blue-angel-1930-restored-movie-720p-hd/the%20blue%20angel-1930-restored%20movie-720p-hd.mp4",
    json: "public/subtitles/the-blue-angel.json",
  },
];

function round2(x) {
  return Math.round(x * 100) / 100;
}

function englishFromCue(cue) {
  return cue.words.map((w) => w.en).join(" ").trim();
}

function norm(s) {
  return s
    .toLowerCase()
    .replace(/[’'`´]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchScore(ocrRaw, expected) {
  const o = norm(ocrRaw);
  const e = norm(expected);
  if (!e.length) return 0;
  if (!o.length) return 0;
  if (o.includes(e) || e.includes(o)) return 0.95;
  const eTok = e.split(/\s+/).filter(Boolean);
  const oTok = o.split(/\s+/).filter(Boolean);
  if (!eTok.length) return 0;
  let hit = 0;
  for (const t of eTok) {
    if (t.length <= 2) {
      if (oTok.includes(t)) hit++;
      continue;
    }
    if (oTok.some((x) => x === t || x.includes(t) || t.includes(x))) hit++;
  }
  return hit / eTok.length;
}

/**
 * Scale first (stable iw/ih), then crop bottom ~3/8 — avoids 2×36px crops on some seeks.
 */
const VF_SUBSTRIP =
  "scale=w=960:h=-2:flags=fast_bilinear,crop=iw:trunc(ih*3/8):0:ih-trunc(ih*3/8),format=gray,eq=contrast=1.12:brightness=0.04";

function extractFramePng(videoUrl, tSec, outPng) {
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      String(tSec),
      "-i",
      videoUrl,
      "-vframes",
      "1",
      "-vf",
      VF_SUBSTRIP,
      "-update",
      "1",
      outPng,
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  return r.status === 0 && fs.existsSync(outPng) && fs.statSync(outPng).size > 1800;
}

async function scanCueWindow(worker, videoUrl, t0, t1, stepSec, expectedEn) {
  const samples = [];
  for (let t = t0; t <= t1 + 1e-6; t += stepSec) {
    const png = path.join(os.tmpdir(), `relingua-ocr-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
    if (!extractFramePng(videoUrl, t, png)) {
      try {
        fs.unlinkSync(png);
      } catch {
        /* ignore */
      }
      continue;
    }
    const {
      data: { text },
    } = await worker.recognize(png);
    try {
      fs.unlinkSync(png);
    } catch {
      /* ignore */
    }
    const sc = matchScore(text, expectedEn);
    samples.push({ t: round2(t), tRaw: t, text: text.trim().slice(0, 120), ocr: text, score: sc });
  }
  return samples;
}

function pickBounds(samples, minScore, origStart, origEnd, shortCue) {
  if (!samples.length) return null;
  const thr = Math.max(
    minScore * (shortCue ? 0.72 : 0.85),
    shortCue ? 0.24 : 0.34,
  );
  const hit = samples.filter((s) => s.score >= thr);
  if (!hit.length) return null;
  const peak = Math.max(...hit.map((s) => s.score));
  let start = Math.min(...hit.map((s) => s.tRaw));
  let end = Math.max(...hit.map((s) => s.tRaw));
  const dur = Math.max(0.35, end - start);
  const pad = Math.min(0.35, dur * 0.12);
  start = round2(Math.max(0, start - pad));
  end = round2(end + pad);
  const origSpan = origEnd - origStart;
  if (origSpan > 3 && end - start < origSpan * 0.24) {
    return null;
  }
  const maxDrift = Math.max(7, origSpan * 0.55);
  if (Math.abs(start - origStart) > maxDrift || Math.abs(end - origEnd) > maxDrift) {
    return null;
  }
  return { start, end, peak };
}

async function processMovie(movie, { maxCues = Infinity, minScore = 0.38, stepSec = 0.4, padBefore = 1.15, padAfter = 2.2 }) {
  const jsonPath = path.join(ROOT, movie.json);
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const cues = data.cues || [];
  const orig = cues.map((c) => ({ start: c.start, end: c.end }));
  const n = Math.min(cues.length, maxCues);

  const worker = await createWorker("eng");
  await worker.setParameters({
    tessedit_pageseg_mode: "7",
  });

  let updated = 0;
  let skipped = 0;

  const skipFirst = SKIP_OCR_CUE_COUNT[movie.id] ?? 0;

  try {
    for (let i = 0; i < n; i++) {
      const cue = cues[i];
      if (i < skipFirst) {
        skipped++;
        process.stdout.write(
          `[${movie.id}] cue ${i + 1}/${n} skipped (wall-clock opening anchor)\n`,
        );
        continue;
      }
      const en = englishFromCue(cue);
      if (!en) {
        skipped++;
        continue;
      }
      const t0 = Math.max(
        0,
        Math.max(orig[i].start - padBefore, i > 0 ? orig[i - 1].end + 0.06 : 0),
      );
      const nextStart = i + 1 < orig.length ? orig[i + 1].start : null;
      const t1 = Math.min(
        orig[i].end + padAfter,
        nextStart != null ? nextStart - 0.1 : orig[i].end + padAfter,
      );
      if (t1 <= t0) {
        skipped++;
        continue;
      }
      const win = t1 - t0;
      const adaptiveStep = Math.min(0.48, Math.max(stepSec, win / 55));
      const samples = await scanCueWindow(worker, movie.videoUrl, t0, t1, adaptiveStep, en);
      const shortCue = en.length < 20;
      const bounds = pickBounds(
        samples,
        shortCue ? 0.3 : minScore,
        orig[i].start,
        orig[i].end,
        shortCue,
      );
      if (bounds) {
        cue.start = bounds.start;
        cue.end = round2(Math.max(bounds.end, bounds.start + 0.4));
        updated++;
        process.stdout.write(
          `[${movie.id}] cue ${i + 1}/${n} peak=${bounds.peak.toFixed(2)} → ${cue.start}–${cue.end}\n`,
        );
      } else {
        skipped++;
        process.stdout.write(`[${movie.id}] cue ${i + 1}/${n} no OCR match (skip)\n`);
      }
    }
  } finally {
    await worker.terminate();
  }

  if (updated === 0) {
    console.log(`No OCR timing updates for ${movie.id} (skipped ${skipped}); file unchanged.`);
    return;
  }

  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end - 0.02) {
      cues[i].start = round2(cues[i - 1].end + 0.05);
    }
    if (cues[i].end <= cues[i].start) cues[i].end = round2(cues[i].start + 0.5);
  }

  if (!String(data.scriptSource || "").includes("burned-in English OCR")) {
    data.scriptSource = `${data.scriptSource || ""}\nTiming pass: burned-in English OCR (tesseract.js + ffmpeg bottom strip) vs. words[].en — ${new Date().toISOString().slice(0, 10)}.`.trim();
  }
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Wrote ${jsonPath} (updated ${updated}, skipped ${skipped})`);
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let id = argv[0] || "viridiana";
  let maxCues = Infinity;
  const mi = argv.indexOf("--max-cues");
  if (mi >= 0 && argv[mi + 1]) maxCues = Number(argv[mi + 1]);
  return { id, maxCues };
}

async function main() {
  const { id, maxCues } = parseArgs();
  const list =
    id === "all" ? CATALOG : CATALOG.filter((m) => m.id === id);
  if (!list.length) {
    console.error("Unknown id. Use:", CATALOG.map((m) => m.id).join(", "), "or all");
    process.exit(1);
  }
  for (const m of list) {
    await processMovie(m, { maxCues });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
