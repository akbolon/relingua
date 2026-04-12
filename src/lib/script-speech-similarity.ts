/**
 * Fuzzy match between browser speech-recognition text and the authored subtitle line.
 * Used to treat “close enough” heard text as noise and keep showing the script.
 */

export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalizeForMatch(s).split(/\s+/).filter(Boolean);
}

/** Jaccard similarity on word sets (0…1). */
export function wordJaccardSimilarity(a: string, b: string): number {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) {
    if (B.has(x)) inter++;
  }
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

/** Normalized Levenshtein similarity 1 − distance / maxLen. */
export function charSimilarity(a: string, b: string): number {
  const x = normalizeForMatch(a);
  const y = normalizeForMatch(b);
  if (!x.length && !y.length) return 1;
  if (!x.length || !y.length) return 0;
  const d = levenshtein(x, y);
  return 1 - d / Math.max(x.length, y.length);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n]!;
}

/**
 * How well `heard` matches the subtitle `script` line.
 * High score ⇒ treat recognizer output as a sloppy paraphrase and keep the script.
 */
export function similarityScriptVsHeard(heard: string, script: string): number {
  const w = wordJaccardSimilarity(heard, script);
  const c = charSimilarity(heard, script);
  return Math.min(1, 0.55 * w + 0.45 * c);
}

/** If true, heard text is close enough to the script line that we treat SR as unreliable and stick to the script. */
export function heardSupportsScriptLine(heard: string, script: string, threshold = 0.36): boolean {
  if (!normalizeForMatch(script)) return false;
  if (!normalizeForMatch(heard)) return false;
  return similarityScriptVsHeard(heard, script) >= threshold;
}
