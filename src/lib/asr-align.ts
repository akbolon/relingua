import { wordJaccardSimilarity } from "@/lib/script-speech-similarity";

/** One timed phrase from Whisper verbose_json (or similar ASR). */
export type AsrSegment = {
  start: number;
  end: number;
  text: string;
};

/** Shift every segment when this clip starts at `timeOffsetSec` in the full timeline. */
export function applyTimeOffsetToSegments(
  segments: AsrSegment[],
  timeOffsetSec: number,
): AsrSegment[] {
  if (!timeOffsetSec) return segments;
  return segments.map((s) => ({
    ...s,
    start: s.start + timeOffsetSec,
    end: s.end + timeOffsetSec,
  }));
}

/** Rough match score between a subtitle cue line and an ASR segment (0…1). */
export function scoreCueAgainstSegment(cueSpanish: string, segmentText: string): number {
  return wordJaccardSimilarity(cueSpanish, segmentText);
}

/** Pick the ASR segment that best matches this cue (by token overlap). */
export function bestMatchingSegment(
  cueSpanish: string,
  segments: AsrSegment[],
): { index: number; score: number; segment: AsrSegment } | null {
  if (!segments.length) return null;
  let bestI = 0;
  let bestS = -1;
  for (let i = 0; i < segments.length; i++) {
    const s = scoreCueAgainstSegment(cueSpanish, segments[i]!.text);
    if (s > bestS) {
      bestS = s;
      bestI = i;
    }
  }
  if (bestS < 0) return null;
  return { index: bestI, score: bestS, segment: segments[bestI]! };
}
