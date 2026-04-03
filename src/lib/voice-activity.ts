/**
 * Lightweight voice-activity proxy from time-domain audio (Web Audio Analyser).
 * Tuned for dialogue vs. gaps; not a full speech recognizer. Subtitle `locale`
 * nudges thresholds for languages that often sit quieter in the mix.
 */

/** RMS of Web Audio float time-domain samples (typically −1…1). */
export function rmsFromFloatTimeDomain(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i]!;
    sum += v * v;
  }
  return Math.sqrt(sum / data.length);
}

export type VoiceGateThresholds = {
  on: number;
  off: number;
  silenceHideMs: number;
  maxWaitSpeechMs: number;
};

/** Locales where dialogue often sits quieter vs. score in typical mixes. */
const QUIETER_DIALOGUE = new Set(["ja", "zh", "yue", "cmn", "ko", "th", "vi"]);

export function thresholdsForLocale(locale: string | undefined): VoiceGateThresholds {
  const base = locale?.split("-")[0]?.toLowerCase() ?? "";
  const scale = QUIETER_DIALOGUE.has(base) ? 0.72 : 1;
  return {
    on: 0.018 * scale,
    off: 0.009 * scale,
    silenceHideMs: 400,
    maxWaitSpeechMs: 2400,
  };
}

export type VoiceCueGate = {
  cueId: string;
  phase: "wait_speech" | "visible" | "done";
  silenceMs: number;
};

export function initialGate(cueId: string): VoiceCueGate {
  return { cueId, phase: "wait_speech", silenceMs: 0 };
}

/**
 * Returns whether the subtitle line should paint for this frame.
 * `inCueWindow`: JSON says we're inside [start, end).
 */
export function stepGate(
  gate: VoiceCueGate,
  cueId: string,
  inCueWindow: boolean,
  rms: number,
  tInCue: number,
  cueDur: number,
  th: VoiceGateThresholds,
  dtMs: number,
  forceJsonFallback: boolean,
): { gate: VoiceCueGate; show: boolean } {
  if (!inCueWindow) {
    return {
      gate: { cueId: "", phase: "wait_speech", silenceMs: 0 },
      show: false,
    };
  }

  if (forceJsonFallback) {
    return {
      gate: { cueId: "", phase: "wait_speech", silenceMs: 0 },
      show: true,
    };
  }

  if (gate.cueId !== cueId) {
    gate = initialGate(cueId);
  }

  const nearCueEnd = tInCue >= cueDur - 0.08;
  const maxWait = tInCue * 1000 >= th.maxWaitSpeechMs;

  if (gate.phase === "wait_speech") {
    if (rms >= th.on || maxWait) {
      return {
        gate: { cueId, phase: "visible", silenceMs: 0 },
        show: true,
      };
    }
    return { gate, show: false };
  }

  if (gate.phase === "visible") {
    if (nearCueEnd) {
      return {
        gate: { cueId, phase: "done", silenceMs: 0 },
        show: false,
      };
    }
    if (rms < th.off) {
      const silenceMs = gate.silenceMs + dtMs;
      if (silenceMs >= th.silenceHideMs) {
        return {
          gate: { cueId, phase: "done", silenceMs: 0 },
          show: false,
        };
      }
      return {
        gate: { cueId, phase: "visible", silenceMs },
        show: true,
      };
    }
    return {
      gate: { cueId, phase: "visible", silenceMs: 0 },
      show: true,
    };
  }

  return { gate, show: false };
}
