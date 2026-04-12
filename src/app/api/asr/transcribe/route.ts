import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applyTimeOffsetToSegments, type AsrSegment } from "@/lib/asr-align";

export const runtime = "nodejs";
/** Vercel / hosted limits; raise in vercel.json if needed. */
export const maxDuration = 120;

const MAX_BYTES = 24 * 1024 * 1024;
const OPENAI_TRANSCRIPTIONS = "https://api.openai.com/v1/audio/transcriptions";

type WhisperVerboseJson = {
  duration?: number;
  language?: string;
  text?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
};

function toSegments(raw: WhisperVerboseJson): AsrSegment[] {
  const segs = raw.segments;
  if (!segs?.length) {
    const t = (raw.text ?? "").trim();
    if (!t) return [];
    const dur = typeof raw.duration === "number" ? raw.duration : 0;
    return [{ start: 0, end: dur || 0.01, text: t }];
  }
  return segs.map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));
}

/**
 * POST multipart/form-data:
 * - `file`: audio (webm, mp3, wav, m4a, mp4, …) ≤ 24 MB
 * - `language` (optional): BCP-47-ish code, default `es`
 * - `timeOffsetSec` (optional): added to each segment start/end (clip offset in the film)
 *
 * Requires signed-in user and `OPENAI_API_KEY`. Returns Whisper `verbose_json`-style segments.
 * Use for alignment tooling / future UI — do not expose API keys to the client.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ASR is not configured (set OPENAI_API_KEY)." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing form field `file`" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB)` },
      { status: 400 },
    );
  }

  const language = String(formData.get("language") || "es")
    .replace(/[^a-zA-Z-]/g, "")
    .slice(0, 12) || "es";

  const timeOffsetRaw = formData.get("timeOffsetSec");
  const timeOffsetSec =
    timeOffsetRaw != null && String(timeOffsetRaw).trim() !== ""
      ? Number(timeOffsetRaw)
      : 0;
  const offset = Number.isFinite(timeOffsetSec) ? Math.max(0, timeOffsetSec) : 0;

  const upstream = new FormData();
  upstream.append("file", file, file.name || "audio.webm");
  upstream.append("model", "whisper-1");
  upstream.append("response_format", "verbose_json");
  upstream.append("language", language);

  const res = await fetch(OPENAI_TRANSCRIPTIONS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: upstream,
  });

  const rawText = await res.text();
  if (!res.ok) {
    let detail = rawText.slice(0, 500);
    try {
      const j = JSON.parse(rawText) as { error?: { message?: string } };
      if (j?.error?.message) detail = j.error.message;
    } catch {
      /* keep detail */
    }
    return NextResponse.json(
      { error: "Upstream ASR failed", status: res.status, detail },
      { status: 502 },
    );
  }

  let parsed: WhisperVerboseJson;
  try {
    parsed = JSON.parse(rawText) as WhisperVerboseJson;
  } catch {
    return NextResponse.json({ error: "Invalid JSON from ASR provider" }, { status: 502 });
  }

  const segments = applyTimeOffsetToSegments(toSegments(parsed), offset);

  return NextResponse.json({
    language: parsed.language ?? language,
    duration: parsed.duration,
    text: (parsed.text ?? "").trim(),
    segments,
    timeOffsetSec: offset,
  });
}
