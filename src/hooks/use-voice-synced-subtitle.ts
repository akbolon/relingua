"use client";

import { useEffect, useRef, useState } from "react";
import type { SubCue } from "@/types/subtitles";
import {
  initialGate,
  rmsFromFloatTimeDomain,
  stepGate,
  thresholdsForLocale,
  type VoiceCueGate,
} from "@/lib/voice-activity";

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

type Graph = { ctx: AudioContext; analyser: AnalyserNode; data: Float32Array };

const graphByVideo = new WeakMap<HTMLVideoElement, Graph>();

function attachAudioGraph(video: HTMLVideoElement): Graph | null {
  const existing = graphByVideo.get(video);
  if (existing && existing.ctx.state !== "closed") return existing;

  const AC = getAudioContextClass();
  if (!AC) return null;

  try {
    const ctx = new AC();
    const source = ctx.createMediaElementSource(video);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;
    const data = new Float32Array(
      new ArrayBuffer(analyser.fftSize * Float32Array.BYTES_PER_ELEMENT),
    );
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const g = { ctx, analyser, data };
    graphByVideo.set(video, g);
    return g;
  } catch {
    return null;
  }
}

function subtitleLanguageLabel(locale: string | undefined): string {
  if (!locale) return "Unknown";
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    return dn.of(locale.split("-")[0] ?? locale) ?? locale;
  } catch {
    return locale;
  }
}

export { subtitleLanguageLabel };

/**
 * Gates subtitle visibility on real-time audio (voice proxy via RMS): line appears
 * when speech energy rises, hides after sustained silence or at cue end. Uses
 * subtitle locale only to tune thresholds. Falls back to JSON [start,end) when
 * sync is off, muted, or Web Audio cannot be wired (e.g. CORS / double-hook).
 */
export function useVoiceSyncedSubtitle(
  video: HTMLVideoElement | null,
  jsonCue: SubCue | null,
  opts: {
    voiceSync: boolean;
    subsOn: boolean;
    muted: boolean;
    volume: number;
    locale: string | undefined;
    playing: boolean;
  },
): SubCue | null {
  const { voiceSync, subsOn, muted, volume, locale, playing } = opts;
  const [out, setOut] = useState<SubCue | null>(null);

  const gateRef = useRef<VoiceCueGate>(initialGate(""));
  const lastEmittedRef = useRef<SubCue | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const zeroRmsMsRef = useRef(0);
  const forceFallbackRef = useRef(false);
  const graphTriedRef = useRef(false);

  const forceJsonTiming = !voiceSync || !subsOn || muted || volume < 0.001;

  useEffect(() => {
    graphTriedRef.current = false;
    forceFallbackRef.current = false;
    zeroRmsMsRef.current = 0;
  }, [video, voiceSync]);

  useEffect(() => {
    if (!video || !voiceSync || !subsOn) return;

    const resume = () => {
      const g = graphByVideo.get(video);
      if (g?.ctx.state === "suspended") void g.ctx.resume();
    };
    video.addEventListener("play", resume);
    video.addEventListener("playing", resume);

    return () => {
      video.removeEventListener("play", resume);
      video.removeEventListener("playing", resume);
    };
  }, [video, voiceSync, subsOn]);

  useEffect(() => {
    if (!video || !subsOn) {
      lastEmittedRef.current = null;
      gateRef.current = initialGate("");
      setOut(null);
      return;
    }

    let raf = 0;
    const th = thresholdsForLocale(locale);

    const tick = () => {
      const t = video.currentTime;
      const cue = jsonCue;
      const cueId = cue ? `${cue.start}-${cue.end}` : "";
      const inWin = !!(cue && t >= cue.start && t < cue.end);
      const tInCue = cue && inWin ? t - cue.start : 0;
      const cueDur = cue && inWin ? Math.max(0.05, cue.end - cue.start) : 0.05;

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const last = lastFrameRef.current;
      lastFrameRef.current = now;
      const dtMs = last != null ? Math.min(120, Math.max(8, now - last)) : 16.7;

      let rms = 0;
      let graph: Graph | null = null;

      if (voiceSync && !muted && volume >= 0.001 && subsOn && !forceJsonTiming) {
        if (!graphTriedRef.current) {
          graphTriedRef.current = true;
          graph = attachAudioGraph(video);
          if (!graph) forceFallbackRef.current = true;
        } else {
          graph = graphByVideo.get(video) ?? null;
        }
        if (graph && graph.ctx.state !== "closed") {
          void graph.ctx.resume?.();
          graph.analyser.getFloatTimeDomainData(
            graph.data as Float32Array<ArrayBuffer>,
          );
          rms = rmsFromFloatTimeDomain(graph.data);
        }
      }

      if (playing && voiceSync && !muted && volume >= 0.001 && graph) {
        if (rms < 1e-5) {
          zeroRmsMsRef.current += dtMs;
          if (zeroRmsMsRef.current > 1200) forceFallbackRef.current = true;
        } else {
          zeroRmsMsRef.current = 0;
        }
      }

      const fallback =
        forceJsonTiming || forceFallbackRef.current || !playing;

      const { gate, show } = stepGate(
        gateRef.current,
        cueId,
        inWin,
        rms,
        tInCue,
        cueDur,
        th,
        dtMs,
        fallback,
      );
      gateRef.current = gate;

      const next: SubCue | null = show && cue ? cue : null;
      const prev = lastEmittedRef.current;
      const changed =
        (next === null) !== (prev === null) ||
        (next && prev && (next.start !== prev.start || next.end !== prev.end));

      if (changed) {
        lastEmittedRef.current = next;
        setOut(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    video,
    jsonCue,
    subsOn,
    voiceSync,
    muted,
    volume,
    locale,
    playing,
    forceJsonTiming,
  ]);

  return out;
}
