export type SubWord = {
  t: string;
  /** English meaning (hover). */
  en: string;
  /** Full pronunciation guide for the original line or phrase (hover). */
  pron?: string;
};

export type SubCue = {
  start: number;
  end: number;
  words: SubWord[];
};

export type SubtitleFile = {
  locale: string;
  cues: SubCue[];
};
