"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SubtitleFile, SubWord } from "@/types/subtitles";

/** HTML5 timeupdate can be sparse; sync subtitle cues more often while playing. */
const TIME_SYNC_MS = 50;

type Props = {
  src: string;
  poster?: string;
  subtitleUrl: string;
  title: string;
  onPlayStart?: () => void;
};

/** Split legacy "English · [pron]" into separate lines when `pron` is absent. */
function glossForWord(w: SubWord): { en: string; pron?: string } {
  if (w.pron !== undefined && w.pron !== "") {
    return { en: w.en, pron: w.pron };
  }
  const sep = " · ";
  const i = w.en.indexOf(sep);
  if (i >= 0) {
    return { en: w.en.slice(0, i).trim(), pron: w.en.slice(i + sep.length).trim() };
  }
  const em = /\s+—\s+/.exec(w.en);
  if (em && em.index > 0) {
    return {
      en: w.en.slice(0, em.index).trim(),
      pron: w.en.slice(em.index + em[0].length).trim(),
    };
  }
  return { en: w.en };
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function bufferedAhead(v: HTMLVideoElement): number {
  try {
    const r = v.buffered;
    if (!r?.length) return 0;
    for (let i = 0; i < r.length; i++) {
      if (v.currentTime >= r.start(i) && v.currentTime <= r.end(i)) {
        return r.end(i);
      }
    }
    return r.end(r.length - 1);
  } catch {
    return 0;
  }
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
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);
  const [bufferedUntil, setBufferedUntil] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subsOn, setSubsOn] = useState(true);
  const [scrubPreview, setScrubPreview] = useState<number | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    en: string;
    pron?: string;
  } | null>(null);

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
    if (!subsOn || !subs?.cues?.length) return null;
    return subs.cues.find((c) => t >= c.start && t < c.end) ?? null;
  }, [subs, subsOn, t]);

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

  useEffect(() => {
    if (!videoEl) return;
    videoEl.volume = vol;
    videoEl.muted = muted || vol < 0.001;
  }, [vol, muted, videoEl]);

  const refreshBuffered = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setBufferedUntil(bufferedAhead(v));
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onProg = () => refreshBuffered();
    v.addEventListener("progress", onProg);
    return () => v.removeEventListener("progress", onProg);
  }, [videoEl, refreshBuffered]);

  useEffect(() => {
    refreshBuffered();
  }, [t, refreshBuffered]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (settingsRef.current?.contains(e.target as Node)) return;
      setSettingsOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [settingsOpen]);

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
        case "l":
          e.preventDefault();
          seek(v.currentTime + 10);
          break;
        case "j":
          e.preventDefault();
          seek(v.currentTime - 10);
          break;
        case "m":
          e.preventDefault();
          setMuted((m) => !m);
          break;
        case "c":
          e.preventDefault();
          setSubsOn((s) => !s);
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
        onDoubleClick={(e) => {
          e.preventDefault();
          toggleFs();
        }}
      />

      {activeCue && (
        <div
          className="pointer-events-auto absolute bottom-[4.5rem] left-1/2 z-10 w-[min(96%,42rem)] -translate-x-1/2 px-3 text-center"
          aria-live="polite"
        >
          <div
            className="glass-subtitle mx-auto inline-block max-w-full rounded-2xl px-4 py-2.5 text-center drop-shadow-md"
            style={{ pointerEvents: "auto" }}
          >
            <p className="text-base font-medium leading-snug tracking-tight text-white sm:text-[1.05rem] sm:leading-snug">
              {activeCue.words.map((w, i) => (
                <span key={`${activeCue.start}-${i}`} className="inline">
                  <span
                    className="cursor-help rounded px-0.5 transition-colors hover:bg-white/20"
                    onMouseEnter={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      const g = glossForWord(w);
                      setTip({
                        x: r.left + r.width / 2,
                        y: r.top,
                        en: g.en,
                        pron: g.pron,
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
          </div>
        </div>
      )}

      {tip ? (
        <div
          className="pointer-events-none fixed z-[60] max-w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-full rounded-md border border-white/35 bg-zinc-950/95 px-3 py-2 text-left text-xs font-normal leading-snug text-zinc-50 shadow-xl ring-1 ring-white/15 backdrop-blur-md dark:border-slate-400/30 dark:bg-slate-950/95 dark:text-slate-50 dark:ring-slate-500/25"
          style={{ left: tip.x, top: tip.y - 8 }}
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">English</p>
          <p className="mt-0.5 text-[0.8125rem] text-zinc-100">{tip.en}</p>
          {tip.pron ? (
            <>
              <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">
                Pronunciation
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-zinc-200">{tip.pron}</p>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="relative mb-2 flex flex-1 flex-col gap-1">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            {dur > 0 ? (
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/25"
                style={{ width: `${Math.min(100, (100 * bufferedUntil) / dur)}%` }}
                aria-hidden
              />
            ) : null}
            {dur > 0 ? (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-sky-400/90 dark:bg-sky-300/90"
                style={{ width: `${Math.min(100, (100 * t) / dur)}%` }}
                aria-hidden
              />
            ) : null}
          </div>
          <div className="relative -mt-2 h-2 pt-0.5">
            <input
              type="range"
              min={0}
              max={dur || 1}
              step={0.05}
              value={t}
              onChange={(e) => {
                seek(Number(e.target.value));
                setScrubPreview(null);
              }}
              onInput={(e) => setScrubPreview(Number((e.target as HTMLInputElement).value))}
              onMouseLeave={() => setScrubPreview(null)}
              onBlur={() => setScrubPreview(null)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Seek"
              aria-valuetext={`${formatTime(scrubPreview ?? t)} of ${formatTime(dur)}`}
            />
            {scrubPreview !== null && dur > 0 ? (
              <span
                className="pointer-events-none absolute -top-7 z-10 -translate-x-1/2 rounded border border-white/30 bg-black/85 px-1.5 py-0.5 font-mono text-[0.65rem] tabular-nums text-white"
                style={{ left: `${Math.min(100, Math.max(0, (100 * scrubPreview) / dur))}%` }}
              >
                {formatTime(scrubPreview)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20"
              aria-label={playing ? "Pause" : "Play"}
              title={playing ? "Pause (k)" : "Play (k)"}
            >
              {playing ? "||" : "▶"}
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-sm text-white backdrop-blur-sm hover:bg-white/20"
                aria-label={muted || vol < 0.001 ? "Unmute" : "Mute"}
                title={muted || vol < 0.001 ? "Unmute (m)" : "Mute (m)"}
              >
                {muted || vol < 0.001 ? "🔇" : vol < 0.5 ? "🔉" : "🔊"}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : vol}
                onChange={(e) => {
                  const x = Number(e.target.value);
                  setVol(x);
                  if (x > 0) setMuted(false);
                }}
                className="h-1 w-20 cursor-pointer accent-sky-400 dark:accent-sky-300 sm:w-24"
                aria-label="Volume"
              />
            </div>
            <span
              className="font-mono text-xs tabular-nums text-white/95"
              aria-live="polite"
              title="Current time / duration"
            >
              {formatTime(t)} / {formatTime(dur)}
            </span>
          </div>
          <p className="order-last min-w-0 w-full truncate text-center text-xs font-medium text-white sm:order-none sm:w-auto sm:flex-1 sm:text-sm">
            {title}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {typeof document !== "undefined" &&
            "pictureInPictureEnabled" in document &&
            document.pictureInPictureEnabled &&
            typeof HTMLVideoElement.prototype.requestPictureInPicture === "function" ? (
              <button
                type="button"
                onClick={async () => {
                  const v = videoRef.current;
                  if (!v) return;
                  try {
                    if (document.pictureInPictureElement === v) {
                      await document.exitPictureInPicture();
                    } else {
                      await v.requestPictureInPicture();
                    }
                  } catch {
                    /* ignore */
                  }
                }}
                className="hidden sm:inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-2 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/20"
                aria-label="Picture in picture"
                title="Picture in picture"
              >
                PiP
              </button>
            ) : null}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setSettingsOpen((o) => !o)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20"
                aria-label="Settings"
                title="Settings"
                aria-expanded={settingsOpen}
              >
                ⚙
              </button>
              {settingsOpen ? (
                <div className="absolute bottom-full right-0 z-20 mb-2 w-56 rounded-xl border border-white/25 bg-black/90 p-3 text-left text-white shadow-xl backdrop-blur-md dark:border-slate-300/35 dark:bg-slate-950/95">
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wide text-white/60">
                    Playback speed
                  </p>
                  <select
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="mb-3 w-full rounded-lg border border-white/35 bg-black/55 px-2 py-1.5 text-sm text-white outline-none ring-sky-400/50 focus:ring-2 dark:border-slate-300/45 dark:bg-slate-900/90"
                    aria-label="Playback speed"
                  >
                    {SPEEDS.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900 text-slate-100">
                        {s}×
                      </option>
                    ))}
                  </select>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white/95">
                    <input
                      type="checkbox"
                      checked={subsOn}
                      onChange={(e) => setSubsOn(e.target.checked)}
                      className="h-4 w-4 rounded border-white/40 accent-sky-400 dark:accent-sky-300"
                    />
                    Show subtitles
                  </label>
                  <p className="mt-3 border-t border-white/15 pt-2 text-[0.65rem] leading-snug text-white/55">
                    k play/pause · j / l ±10s · m mute · c subs · f fullscreen · double-click video fullscreen
                  </p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={toggleFs}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-3 py-2 text-base text-white backdrop-blur-sm hover:bg-white/20"
              aria-label="Fullscreen"
              title="Fullscreen (f)"
            >
              □
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
