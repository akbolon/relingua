export type SubWord = { t: string; en: string };

export type SubCue = {
  start: number;
  end: number;
  words: SubWord[];
};

export type SubtitleFile = {
  locale: string;
  cues: SubCue[];
};
