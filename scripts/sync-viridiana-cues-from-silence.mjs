/**
 * Remap viridiana.json cue timings from ffmpeg silencedetect (Internet Archive Viridiana.mp4).
 * Log file is often UTF-16 LE on Windows (PowerShell stderr).
 *
 * ffmpeg -y -i "https://archive.org/download/viridiana_202108/Viridiana.mp4" \
 *   -af silencedetect=noise=-30dB:d=0.45 -f null - 2> scripts/vir-silence-full.txt
 * node scripts/sync-viridiana-cues-from-silence.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logPath =
  process.argv[2] || path.join(__dirname, "vir-silence-full.txt");
const jsonPath = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

function readTextLog(p) {
  const buf = fs.readFileSync(p);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString("utf16le");
  }
  return buf.toString("utf8");
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function parseSpeech(text) {
  const events = [];
  const re = /silence_(start|end): ([0-9.]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    events.push({ kind: m[1], t: Number(m[2]) });
  }
  const speech = [];
  let pendingEnd = null;
  for (const e of events) {
    if (e.kind === "end") pendingEnd = e.t;
    else if (e.kind === "start" && pendingEnd !== null) {
      if (e.t > pendingEnd) speech.push({ start: pendingEnd, end: e.t });
      pendingEnd = null;
    }
  }
  return speech;
}

function mergeSpeech(segments, minGap = 0.45, minDur = 0.32) {
  const sorted = [...segments]
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start);
  const out = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start - last.end < minGap) {
      last.end = Math.max(last.end, s.end);
    } else if (s.end - s.start >= minDur) {
      out.push({ start: s.start, end: s.end });
    }
  }
  return out;
}

function main() {
  const raw = readTextLog(logPath);
  const speech = mergeSpeech(parseSpeech(raw));
  const t0 = 115;
  const t1 = 370;
  const segs = mergeSpeech(
    speech
      .map((s) => ({
        start: Math.max(s.start, t0),
        end: Math.min(s.end, t1),
      }))
      .filter((s) => s.end > s.start),
    0.35,
    0.2,
  );

  let speechTotal = 0;
  for (const s of segs) speechTotal += s.end - s.start;

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const cues = data.cues;
  let sumOld = 0;
  for (const c of cues) sumOld += c.end - c.start;

  let cursor = segs[0] ? segs[0].start : t0;
  for (let i = 0; i < cues.length; i++) {
    const dOld = cues[i].end - cues[i].start;
    const need = (dOld / sumOld) * speechTotal * 0.98;
    const startWall = cursor;
    let needLeft = need;
    let t = startWall;
    let si = 0;
    while (si < segs.length && needLeft > 1e-4) {
      const s = segs[si];
      if (t < s.start) t = s.start;
      if (t >= s.end) {
        si++;
        continue;
      }
      const avail = s.end - t;
      const take = Math.min(avail, needLeft);
      needLeft -= take;
      t += take;
      if (take >= avail - 1e-6) si++;
    }
    cues[i].start = round2(startWall);
    cues[i].end = round2(Math.max(t, startWall + 0.5));
    cursor = t;
  }

  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end) {
      cues[i].start = round2(cues[i - 1].end + 0.05);
    }
    if (cues[i].end <= cues[i].start) {
      cues[i].end = round2(cues[i].start + 0.55);
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(
    "OK",
    cues.length,
    "cues; segments",
    segs.length,
    "speechTotal",
    speechTotal.toFixed(1),
  );
}

main();
