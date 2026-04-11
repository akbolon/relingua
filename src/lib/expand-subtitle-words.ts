import type { SubWord } from "@/types/subtitles";
import { ES_LEARNER_LEXICON } from "@/lib/es-learner-lexicon";

/** Strip accents for lexicon keys (NFD + remove combining marks). */
export function stripSpanishAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

const LEX_BY_NORM: Record<string, { en: string; pron?: string }> = (() => {
  const m: Record<string, { en: string; pron?: string }> = {};
  for (const [k, v] of Object.entries(ES_LEARNER_LEXICON)) {
    const nk = stripSpanishAccents(k).toLowerCase();
    const prev = m[nk];
    if (prev && prev.en !== v.en) {
      m[nk] = { ...v, en: `${prev.en} · ${v.en}` };
    } else {
      m[nk] = v;
    }
  }
  return m;
})();

function trimPunct(s: string): string {
  return s.replace(/^[^\p{L}\p{N}¿¡]+/u, "").replace(/[^\p{L}\p{N}]+$/u, "");
}

export function tokenKey(surface: string): string {
  const t = trimPunct(surface);
  if (/^él$/iu.test(t)) return "__el_pronoun";
  if (/^sí$/iu.test(t)) return "__si_yes";
  if (/^mí$/iu.test(t)) return "__mi_pronoun";
  if (/^tú$/iu.test(t)) return "__tu_pronoun";
  if (/^sé$/iu.test(t)) return "__se_know";
  if (/^estás$/iu.test(t)) return "__estas_you_are";
  return stripSpanishAccents(t).toLowerCase();
}

const DISAMBIG: Record<string, { en: string; pron?: string }> = {
  __el_pronoun: { en: "he; him" },
  __si_yes: { en: "yes" },
  __mi_pronoun: { en: "me (after preposition)", pron: "mee" },
  __tu_pronoun: { en: "you (singular, fam.)", pron: "too" },
  __se_know: { en: "I know (from saber)" },
  __estas_you_are: { en: "you are (tú)" },
};

export function lookupSpanishToken(surface: string): { en: string; pron?: string } | null {
  const d = DISAMBIG[tokenKey(surface)];
  if (d) return d;
  const t = trimPunct(surface);
  const nk = stripSpanishAccents(t).toLowerCase();
  return LEX_BY_NORM[nk] ?? null;
}

/**
 * When a cue packs a whole sentence into one `words[]` item, split into hoverable tokens
 * for Spanish. Other locales: keep entries as-is (catalog files are already per-word).
 */
export function expandSubWordsForDisplay(words: SubWord[], locale: string | undefined): SubWord[] {
  if (locale && locale !== "es") {
    return words;
  }

  const out: SubWord[] = [];

  for (const w of words) {
    const text = w.t.trim();
    if (!text) {
      if (w.en?.trim()) {
        out.push({ t: "…", en: w.en, pron: w.pron });
      }
      continue;
    }

    const tokens = text.split(/\s+/).filter(Boolean);

    if (tokens.length <= 1) {
      const hit = lookupSpanishToken(tokens[0] ?? text);
      if (hit) {
        out.push({
          t: tokens[0] ?? text,
          en: hit.en,
          pron: hit.pron ?? w.pron,
        });
      } else {
        out.push(w);
      }
      continue;
    }

    const lineEn = w.en?.trim() || "";
    for (const tok of tokens) {
      const hit = lookupSpanishToken(tok);
      if (hit) {
        out.push({ t: tok, en: hit.en, pron: hit.pron });
      } else {
        out.push({
          t: tok,
          en: "—",
          pron: undefined,
          fullLineEn: lineEn || undefined,
        });
      }
    }
  }

  return out;
}
