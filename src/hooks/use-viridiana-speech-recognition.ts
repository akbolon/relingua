"use client";

import { useEffect, useRef, useState } from "react";
import { heardSupportsScriptLine, similarityScriptVsHeard } from "@/lib/script-speech-similarity";

/** Minimal Web Speech API surface (DOM lib types vary by TS target). */
type SpeechRecLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecResultEvent) => void) | null;
  onerror: ((ev: SpeechRecErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecResultEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { 0: { transcript: string }; isFinal: boolean };
  };
};

type SpeechRecErrorEvent = { error: string; message?: string };

type SpeechRecCtor = new () => SpeechRecLike;

function getSpeechRecognitionCtor(): SpeechRecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Web Speech API (Chrome/Edge): listens via the **microphone**, not the video track.
 * Compares interim/final text to the current subtitle line; when similarity is high,
 * we treat SR as a sloppy listener and keep the on-screen script (see parent).
 * Viridiana-only: pass `enabled` false for other titles.
 */
export function useViridianaSpeechRecognition(opts: {
  enabled: boolean;
  /** Only runs when `viridiana`. */
  movieId: string | undefined;
  playing: boolean;
  /** Current JSON cue Spanish line (authoritative script). */
  scriptLine: string;
}): {
  supported: boolean;
  listening: boolean;
  /** Last SR transcript slice (debug / status). */
  lastHeard: string;
  /** True when heard text is plausibly the same utterance as `scriptLine`. */
  alignsWithScript: boolean;
  similarity: number;
  error: string | null;
} {
  const { enabled, movieId, playing, scriptLine } = opts;
  const isViridiana = movieId === "viridiana";

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [alignsWithScript, setAlignsWithScript] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SpeechRecLike | null>(null);
  const heardRollingRef = useRef("");
  const scriptRef = useRef(scriptLine);
  const runRef = useRef({ enabled: false, playing: false, viridiana: false });

  useEffect(() => {
    scriptRef.current = scriptLine;
    heardRollingRef.current = "";
    setLastHeard("");
    setAlignsWithScript(false);
    setSimilarity(0);
  }, [scriptLine]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  useEffect(() => {
    runRef.current = { enabled, playing, viridiana: isViridiana };
  }, [enabled, playing, isViridiana]);

  useEffect(() => {
    if (!isViridiana || !enabled) {
      recRef.current?.abort();
      recRef.current = null;
      setListening(false);
      setError(null);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = "es-ES";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const bump = (add: string) => {
      if (!add.trim()) return;
      const roll = `${heardRollingRef.current} ${add}`.trim().slice(-800);
      heardRollingRef.current = roll;
      setLastHeard(roll.slice(-160));
      const script = scriptRef.current;
      const sim = similarityScriptVsHeard(roll, script);
      setSimilarity(sim);
      setAlignsWithScript(heardSupportsScriptLine(roll, script, 0.36));
    };

    rec.onresult = (ev: SpeechRecResultEvent) => {
      let chunk = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        chunk += ev.results[i]![0]!.transcript;
      }
      bump(chunk);
    };

    rec.onerror = (ev: SpeechRecErrorEvent) => {
      if (ev.error === "aborted" || ev.error === "no-speech") return;
      setError(ev.error === "not-allowed" ? "Microphone permission denied." : ev.message || ev.error);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      const { enabled: en, playing: pl, viridiana: vi } = runRef.current;
      if (!en || !vi || !pl || recRef.current !== rec) return;
      try {
        rec.start();
        setListening(true);
      } catch {
        /* already running */
      }
    };

    if (playing) {
      setError(null);
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }

    return () => {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      if (recRef.current === rec) recRef.current = null;
      setListening(false);
    };
  }, [isViridiana, enabled, playing]);

  return { supported, listening, lastHeard, alignsWithScript, similarity, error };
}
