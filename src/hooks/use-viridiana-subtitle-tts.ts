"use client";

import { useEffect, useRef } from "react";
import type { SubCue } from "@/types/subtitles";

function cueSpanishLine(cue: SubCue | null): string {
  if (!cue?.words?.length) return "";
  return cue.words
    .map((w) => w.t)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefer = (lang: string) =>
    voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ?? null;
  return prefer("es-") ?? prefer("es") ?? null;
}

/**
 * Reads the **built-in subtitle script** (JSON cue Spanish) when the timed cue changes.
 * Viridiana-only: `enabled` should be false for other films.
 */
export function useViridianaSubtitleTts(opts: {
  enabled: boolean;
  movieId: string | undefined;
  playing: boolean;
  /** Time-based active cue from JSON (not voice-gated). */
  jsonActiveCue: SubCue | null;
}): void {
  const { enabled, movieId, playing, jsonActiveCue } = opts;
  const isViridiana = movieId === "viridiana";
  const lastCueIdRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const onVoices = () => {
      /* force voice list load in some browsers */
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (!isViridiana || !enabled) {
      window.speechSynthesis.cancel();
      lastCueIdRef.current = "";
      return;
    }

    if (!playing || !jsonActiveCue) {
      window.speechSynthesis.cancel();
      return;
    }

    const line = cueSpanishLine(jsonActiveCue);
    if (!line) return;

    const id = `${jsonActiveCue.start}-${jsonActiveCue.end}`;
    if (lastCueIdRef.current === id) return;
    lastCueIdRef.current = id;

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.lang = "es-ES";
    u.rate = 0.92;
    u.pitch = 1;
    u.volume = 0.95;
    const voice = pickSpanishVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }, [isViridiana, enabled, playing, jsonActiveCue]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);
}
