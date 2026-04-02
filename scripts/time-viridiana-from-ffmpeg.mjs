/**
 * Run ffmpeg silencedetect on IA Viridiana.mp4, parse stderr (UTF-8),
 * return merged speech segments for timing.
 */
import { spawn } from "child_process";

const IA =
  "https://archive.org/download/viridiana_202108/Viridiana.mp4";

export function parseSpeechFromText(text) {
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

export async function fetchSpeechSegments(tMaxSec = 520) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const ff = spawn(
      "ffmpeg",
      [
        "-y",
        "-t",
        String(tMaxSec),
        "-i",
        IA,
        "-af",
        "silencedetect=noise=-30dB:d=0.45",
        "-f",
        "null",
        "-",
      ],
      { windowsHide: true },
    );
    ff.stderr.on("data", (d) => chunks.push(d));
    ff.on("error", reject);
    ff.on("close", (code) => {
      const text = Buffer.concat(chunks).toString("utf8");
      const speech = mergeSpeech(parseSpeechFromText(text));
      resolve(speech);
    });
  });
}
