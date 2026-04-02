"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SubtitleFile } from "@/types/subtitles";

/** HTML5 timeupdate can be sparse; sync subtitle cues more often while playing. */
const TIME_SYNC_MS = 50;

type Props = {
  src: string;
  poster?: string;
  subtitleUrl: string;
  title: string;
  onPlayStart?: () => void;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ src, poster, subtitleUrl, title, onPlayStart }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoEl(node);
  }, []);
  const shellRef = useRef<HTMLDivElement>(null);
  const [subs, setSubs] = useState<SubtitleFile | null>(null);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(subtitleUrl);
        if (!res.ok) return;
        const data = (await res.json()) as SubtitleFile;
        if (!cancelled) setSubs(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subtitleUrl]);

  const activeCue = useMemo(() => {
    if (!subs?.cues?.length) return null;
    return subs.cues.find((c) => t >= c.start && t < c.end) ?? null;
  }, [subs, t]);

  useEffect(() => {
    if (!videoEl) return;

    const onDur = () => setDur(videoEl.duration || 0);
    const syncTime = () => setT(videoEl.currentTime);

    let interval: ReturnType<typeof setInterval> | null = null;
    const onPlay = () => {
      setPlaying(true);
      if (interval) clearInterval(interval);
      interval = setInterval(syncTime, TIME_SYNC_MS);
    };
    const onPause = () => {
      setPlaying(false);
      if (interval) clearInterval(interval);
      interval = null;
      syncTime();
    };

    videoEl.addEventListener("loadedmetadata", onDur);
    videoEl.addEventListener("play", onPlay);
    videoEl.addEventListener("pause", onPause);
    videoEl.addEventListener("seeking", syncTime);
    videoEl.addEventListener("seeked", syncTime);
    videoEl.addEventListener("timeupdate", syncTime);

    if (videoEl.readyState >= 1) onDur();
    if (!videoEl.paused) onPlay();

    return () => {
      if (interval) clearInterval(interval);
      videoEl.removeEventListener("loadedmetadata", onDur);
      videoEl.removeEventListener("play", onPlay);
      videoEl.removeEventListener("pause", onPause);
      videoEl.removeEventListener("seeking", syncTime);
      videoEl.removeEventListener("seeked", syncTime);
      videoEl.removeEventListener("timeupdate", syncTime);
    };
  }, [videoEl]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      onPlayStart?.();
      void v.play();
    } else v.pause();
  }, [onPlayStart]);

  const seek = useCallback((next: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(next, v.duration || next));
    setT(v.currentTime);
  }, []);

  useEffect(() => {
    if (videoEl) videoEl.playbackRate = rate;
  }, [rate, videoEl]);

  const toggleFs = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) void el.requestFullscreen();
    else void document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(v.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(v.currentTime + 10);
          break;
        case "f":
          e.preventDefault();
          toggleFs();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seek, toggleFs, togglePlay]);

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2800);
  }, []);

  useEffect(() => {
    bumpControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [bumpControls]);

  return (
    <div
      ref={shellRef}
      className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl ring-1 ring-black/10 dark:border-white/10 dark:ring-white/5"
      onMouseMove={bumpControls}
    >
      <video
        ref={attachVideo}
        className="aspect-video w-full bg-black object-contain"
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {activeCue && (
        <div
          className="pointer-events-auto absolute bottom-[4.5rem] left-1/2 z-10 w-[min(96%,42rem)] -translate-x-1/2 px-3 text-center"
          aria-live="polite"
        >
          <div
            className="glass-subtitle mx-auto inline-flex max-w-full flex-col items-center gap-1.5 rounded-2xl px-4 py-2.5 text-left drop-shadow-md"
            style={{ pointerEvents: "auto" }}
          >
            <p className="text-center text-base font-medium leading-snug tracking-tight text-white sm:text-[1.05rem] sm:leading-snug">
              {activeCue.words.map((w, i) => (
                <span key={`${activeCue.start}-${i}`} className="inline">
                  <span
                    className="cursor-help rounded px-0.5 transition-colors hover:bg-white/20"
                    onMouseEnter={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setTip({
                        x: r.left + r.width / 2,
                        y: r.top,
                        text: w.en,
                      });
                    }}
                    onMouseLeave={() => setTip(null)}
                  >
                    {w.t}
                  </span>
                  {i < activeCue.words.length - 1 ? " " : null}
                </span>
              ))}
            </p>
            {activeCue.enLine ? (
              <p className="max-w-prose text-center text-sm leading-snug text-white/80 sm:text-[0.9375rem]">
                {activeCue.enLine}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {tip ? (
        <div
          className="pointer-events-none fixed z-[60] max-w-[min(90vw,20rem)] -translate-x-1/2 -translate-y-full rounded-md border border-white/35 bg-zinc-950/95 px-2.5 py-1.5 text-left text-xs font-normal leading-snug text-zinc-50 shadow-xl ring-1 ring-white/15 backdrop-blur-md dark:border-slate-400/30 dark:bg-slate-950/95 dark:text-slate-50 dark:ring-slate-500/25"
          style={{ left: tip.x, top: tip.y - 8 }}
        >
          {tip.text}
        </div>
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={dur || 1}
            step={0.05}
            value={t}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer accent-sky-400 dark:accent-sky-300"
            aria-label="Seek"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20"
              aria-label={playing ? "Pause" : "Play"}
              title={playing ? "Pause" : "Play"}
            >
              {playing ? "||" : "▶"}
            </button>
            <span className="font-mono text-xs tabular-nums text-white/95" aria-live="polite">
              {formatTime(t)} / {formatTime(dur)}
            </span>
          </div>
          <p className="min-w-0 flex-1 truncate text-center text-xs font-medium text-white sm:text-sm">
            {title}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-1 text-xs text-white/90">
              <span className="sr-only">Playback speed</span>
              <span className="text-white/75" aria-hidden>
                ×
              </span>
              <select
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="rounded-xl border border-white/35 bg-black/55 px-2 py-1 text-xs text-white outline-none ring-sky-400/50 focus:ring-2 dark:border-slate-300/45 dark:bg-slate-900/90"
                aria-label="Playback speed"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s} className="bg-zinc-900 text-slate-100">
                    {s}×
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={toggleFs}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-base text-white backdrop-blur-sm hover:bg-white/20"
              aria-label="Fullscreen"
              title="Fullscreen"
            >
              □
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
