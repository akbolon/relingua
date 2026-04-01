export type Movie = {
  id: string;
  title: string;
  year: number;
  language: string;
  languageCode: string;
  rating: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  archiveId?: string;
  subtitlePath: string;
  kind: "film" | "series";
  seriesEpisode?: string;
};

/** Build a direct download URL for an Internet Archive item file name. */
function iaFile(archiveId: string, fileName: string) {
  return `https://archive.org/download/${archiveId}/${encodeURIComponent(fileName)}`;
}

function iaPoster(archiveId: string) {
  return `https://archive.org/services/img/${archiveId}`;
}

/**
 * Curated public-domain (or rights-cleared) sound films with non-English dialogue.
 * File names were checked against archive.org metadata for each identifier.
 */
export const MOVIES: Movie[] = [
  {
    id: "viridiana",
    title: "Viridiana",
    year: 1961,
    language: "Spanish",
    languageCode: "es",
    rating: "PG-13",
    description:
      "A novice is sent to visit her widowed uncle before taking her vows; Luis Buñuel’s Cannes-winning drama of faith and cruelty.",
    videoUrl: iaFile("viridiana_202108", "Viridiana.mp4"),
    posterUrl: iaPoster("viridiana_202108"),
    archiveId: "viridiana_202108",
    subtitlePath: "/subtitles/viridiana.json",
    kind: "film",
  },
  {
    id: "ladri-di-biciclette",
    title: "Ladri di biciclette",
    year: 1948,
    language: "Italian",
    languageCode: "it",
    rating: "PG",
    description:
      "In post-war Rome, a father’s stolen bicycle threatens his family’s survival; Vittorio De Sica’s landmark of Italian neorealism.",
    videoUrl: iaFile(
      "ladri-di-biciclette-vittorio-de-sica-1948-b-n-720p",
      "LADRI DI BICICLETTE (Vittorio De Sica, 1948 - b_n 720p).mp4",
    ),
    posterUrl: iaPoster("ladri-di-biciclette-vittorio-de-sica-1948-b-n-720p"),
    archiveId: "ladri-di-biciclette-vittorio-de-sica-1948-b-n-720p",
    subtitlePath: "/subtitles/ladri-di-biciclette.json",
    kind: "film",
  },
  {
    id: "rashomon",
    title: "Rashomon",
    year: 1950,
    language: "Japanese",
    languageCode: "ja",
    rating: "PG-13",
    description:
      "Conflicting accounts of a crime in a forest reveal Akira Kurosawa’s meditation on truth and perspective.",
    videoUrl: iaFile("rashomon-1950_202408", "Rashomon_1950.mp4"),
    posterUrl: iaPoster("rashomon-1950_202408"),
    archiveId: "rashomon-1950_202408",
    subtitlePath: "/subtitles/rashomon.json",
    kind: "film",
  },
  {
    id: "pather-panchali",
    title: "Pather Panchali",
    year: 1955,
    language: "Bengali",
    languageCode: "bn",
    rating: "PG",
    description:
      "Childhood in rural Bengal unfolds in Satyajit Ray’s lyrical first chapter of the Apu trilogy.",
    videoUrl: iaFile("pather-panchali-1955_202601", "Pather Panchali (1955).mp4"),
    posterUrl: iaPoster("pather-panchali-1955_202601"),
    archiveId: "pather-panchali-1955_202601",
    subtitlePath: "/subtitles/pather-panchali.json",
    kind: "film",
  },
  {
    id: "det-sjunde-inseglet",
    title: "Det sjunde inseglet",
    year: 1957,
    language: "Swedish",
    languageCode: "sv",
    rating: "PG-13",
    description:
      "A knight returns from the Crusades to a plague-ridden Sweden and plays chess with Death in Ingmar Bergman’s allegory.",
    videoUrl: iaFile("det-sjunde-inseglet", "Det sjunde inseglet.mp4"),
    posterUrl: iaPoster("det-sjunde-inseglet"),
    archiveId: "det-sjunde-inseglet",
    subtitlePath: "/subtitles/seventh-seal.json",
    kind: "film",
  },
];

export function getMovieById(id: string): Movie | undefined {
  return MOVIES.find((m) => m.id === id);
}
