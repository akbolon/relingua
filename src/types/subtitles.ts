export type SubWord = { t: string; en: string };

export type SubCue = {
  start: number;
  end: number;
  /** Full-sentence English gloss, shown under Spanish for the same cue window. */
  enLine?: string;
  words: SubWord[];
};

export type SubtitleFile = {
  locale: string;
  cues: SubCue[];
};
