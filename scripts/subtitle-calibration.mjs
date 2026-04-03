/**
 * Subtitle wall-clock calibration vs. Internet Archive streams (same idea as Viridiana:
 * anchor cues to real audio, not synthetic gaps).
 *
 * How we derived offsets (2026-04): for each IA item, ffmpeg on ~7 min of audio
 *   ffmpeg -hide_banner -i "<videoUrl>" -t 420 -af silencedetect=noise=-38dB:d=0.35 -f null -
 * Read the first long silence_end after the opening (≈ when sustained sound/dialogue begins).
 * Compared to the first cue start in our JSON; shift = anchor − firstCueStart (negative = move
 * cues earlier). Applied via scripts/shift-subtitle-times.mjs.
 *
 * Regeneration: reflow-subtitles.mjs / seed-catalog-subtitles.mjs / whisper-to-relingua-json.mjs
 * embed the corrected base offsets so you usually do not need to shift again.
 *
 * Re-probe if archive.org replaces a file or sync still feels wrong.
 *
 * IA English vs. our English glosses: archive.org items for these films do not publish
 * separate English .srt/.vtt next to the MP4 (except Seventh Seal, which has Swedish
 * sidecar subs only). Embedded subtitle streams in the MP4 are absent (see
 * scripts/ia-subtitle-inventory.mjs). Relingua keeps English in words[].en on the same
 * cue as the original line; there is no second English timeline on IA to merge.
 */
export const SUBTITLE_CALIBRATION = {
  "viridiana.json": { shiftSec: -2, note: "Whisper ASR + nudge; −2s vs. IA spot-check" },
  "ladri-di-biciclette.json": { shiftSec: -7, anchorSec: 50, note: "voiceover ~50s vs. old 57" },
  "rashomon.json": { shiftSec: -81, anchorSec: 37, note: "narration after ~36.5s silence; old first cue 118" },
  "pather-panchali.json": { shiftSec: -47, anchorSec: 198, note: "first dialogue band ~198s; old 245" },
  "seventh-seal.json": { shiftSec: -2.5, anchorSec: 69.5, note: "Bergman ~69.4s; old 72" },
  "m-1931.json": { shiftSec: -71, anchorSec: 37, note: "Warte line ~37s; seed offset 108 was wrong" },
  "the-blue-angel.json": { shiftSec: -4, anchorSec: 90, note: "weak silencedetect; small nudge vs. 94" },
};
