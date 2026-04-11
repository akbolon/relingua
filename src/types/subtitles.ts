export type SubWord = {
  t: string;
  /** English meaning (hover). */
  en: string;
  /** Full pronunciation guide for the original line or phrase (hover). */
  pron?: string;
  /** When a word was split from a sentence cue and has no lexicon entry, full-line English. */
  fullLineEn?: string;
};

export type SubCue = {
  start: number;
  end: number;
  words: SubWord[];
};

export type SubtitleFile = {
  locale: string;
  /** Optional note on screenplay source (e.g. Script Savant PDF). */
  scriptSource?: string;
  cues: SubCue[];
};
