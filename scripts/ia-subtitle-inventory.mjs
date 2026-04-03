/**
 * Lists Internet Archive subtitle assets for each catalog film: standalone .srt/.vtt/.ass
 * in the item (metadata API) and whether the streaming MP4 contains embedded subtitle streams
 * (ffprobe, requires network).
 *
 * Run: node scripts/ia-subtitle-inventory.mjs
 *
 * Findings (re-checked when you add titles): English timed text is rarely present alongside
 * these MP4s; Seventh Seal ships Swedish .srt/.vtt. Our JSON pairs English glosses in
 * words[].en with the same cue timing as the original line — there is no separate English
 * track on IA to align unless you add a proxy or external subtitle file.
 */
import { spawnSync } from "child_process";

/** Mirrors src/lib/movies.ts (video file used in app). */
const CATALOG = [
  { id: "viridiana", archiveId: "viridiana_202108", file: "Viridiana.mp4" },
  {
    id: "ladri-di-biciclette",
    archiveId: "ladri-di-biciclette-vittorio-de-sica-1948-b-n-720p",
    file: "LADRI DI BICICLETTE (Vittorio De Sica, 1948 - b_n 720p).mp4",
  },
  { id: "rashomon", archiveId: "rashomon-1950_202408", file: "Rashomon_1950.mp4" },
  { id: "pather-panchali", archiveId: "pather-panchali-1955_202601", file: "Pather Panchali (1955).mp4" },
  { id: "det-sjunde-inseglet", archiveId: "det-sjunde-inseglet", file: "Det sjunde inseglet.mp4" },
  { id: "m-1931", archiveId: "1931-m", file: "1931 M.mp4" },
  {
    id: "the-blue-angel",
    archiveId: "the-blue-angel-1930-restored-movie-720p-hd",
    file: "the blue angel-1930-restored movie-720p-hd.mp4",
  },
];

function iaUrl(archiveId, fileName) {
  return `https://archive.org/download/${archiveId}/${encodeURIComponent(fileName)}`;
}

function embeddedSubtitleStreamCount(videoUrl) {
  const r = spawnSync(
    "ffprobe",
    [
      "-hide_banner",
      "-v",
      "error",
      "-select_streams",
      "s",
      "-show_entries",
      "stream=index",
      "-of",
      "csv=p=0",
      videoUrl,
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (r.status !== 0 || !r.stdout?.trim()) return 0;
  return r.stdout
    .trim()
    .split(/\r?\n/)
    .filter(Boolean).length;
}

async function main() {
  for (const row of CATALOG) {
    const metaUrl = `https://archive.org/metadata/${row.archiveId}`;
    let sidecar = [];
    let err = "";
    try {
      const res = await fetch(metaUrl);
      const j = await res.json();
      const files = j.files || [];
      sidecar = files
        .map((f) => f.name)
        .filter((n) => /\.(srt|vtt|ssa|ass)$/i.test(n));
    } catch (e) {
      err = String(e?.message || e);
    }

    const videoUrl = iaUrl(row.archiveId, row.file);
    const embedN = embeddedSubtitleStreamCount(videoUrl);

    console.log(`\n${row.id} (${row.archiveId})`);
    console.log(`  MP4 embedded subtitle streams: ${embedN}`);
    if (sidecar.length) {
      console.log(`  Sidecar timed text on IA: ${sidecar.join(", ")}`);
    } else {
      console.log("  Sidecar timed text on IA: (none)");
    }
    if (err) console.log(`  metadata error: ${err}`);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
