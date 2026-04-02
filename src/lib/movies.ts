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
  {
    id: "m-1931",
    title: "M",
    year: 1931,
    language: "German",
    languageCode: "de",
    rating: "PG-13",
    description:
      "Fritz Lang's thriller: Berlin hunts a child murderer—expressionist shadows, sound design, and Peter Lorre's unforgettable performance.",
    videoUrl: iaFile("1931-m", "1931 M.mp4"),
    posterUrl: iaPoster("1931-m"),
    archiveId: "1931-m",
    subtitlePath: "/subtitles/m-1931.json",
    kind: "film",
  },
  {
    id: "the-blue-angel",
    title: "Der blaue Engel",
    year: 1930,
    language: "German",
    languageCode: "de",
    rating: "PG-13",
    description:
      "Josef von Sternberg's Weimar classic: a professor falls for cabaret singer Lola (Marlene Dietrich) in a restored sound-era print.",
    videoUrl: iaFile(
      "the-blue-angel-1930-restored-movie-720p-hd",
      "the blue angel-1930-restored movie-720p-hd.mp4",
    ),
    posterUrl: iaPoster("the-blue-angel-1930-restored-movie-720p-hd"),
    archiveId: "the-blue-angel-1930-restored-movie-720p-hd",
    subtitlePath: "/subtitles/the-blue-angel.json",
    kind: "film",
  },
  {
    id: "detour-1945",
    title: "Detour",
    year: 1945,
    language: "English",
    languageCode: "en",
    rating: "PG-13",
    description:
      "Edgar G. Ulmer's lean noir: a hitchhiker's bad luck spirals into fatalism—shot in days on a B-movie budget, endlessly influential.",
    videoUrl: iaFile("detour-1945", "Detour 1945.mp4"),
    posterUrl: iaPoster("detour-1945"),
    archiveId: "detour-1945",
    subtitlePath: "/subtitles/detour-1945.json",
    kind: "film",
  },
  {
    id: "night-of-the-living-dead",
    title: "Night of the Living Dead",
    year: 1968,
    language: "English",
    languageCode: "en",
    rating: "PG-13",
    description:
      "George A. Romero's indie horror: the dead rise; survivors barricade a farmhouse—landmark gore, social bite, and public-domain status.",
    videoUrl: iaFile(
      "night-of-the-living-dead-1968",
      "Night of the Living Dead (1968).mp4",
    ),
    posterUrl: iaPoster("night-of-the-living-dead-1968"),
    archiveId: "night-of-the-living-dead-1968",
    subtitlePath: "/subtitles/night-of-the-living-dead.json",
    kind: "film",
  },
  {
    id: "third-man-1949",
    title: "The Third Man",
    year: 1949,
    language: "English",
    languageCode: "en",
    rating: "PG",
    description:
      "Carol Reed's Vienna thriller: Holly Martins (Joseph Cotten) searches for Harry Lime—tilted shadows, zither score, Orson Welles in the sewers.",
    videoUrl: iaFile("third-man-1949", "Third Man 1949.mp4"),
    posterUrl: iaPoster("third-man-1949"),
    archiveId: "third-man-1949",
    subtitlePath: "/subtitles/third-man-1949.json",
    kind: "film",
  },
  {
    id: "the-plow-that-broke-the-plains",
    title: "The Plow That Broke the Plains",
    year: 1936,
    language: "English",
    languageCode: "en",
    rating: "G",
    description:
      "Pare Lorentz's New Deal documentary: drought, dust storms, and migration on the Great Plains—US Farm Security Administration production.",
    videoUrl: iaFile(
      "the-plow-that-broke-the-plains-1936",
      "The Plow That Broke The Plains (1936).mp4",
    ),
    posterUrl: iaPoster("the-plow-that-broke-the-plains-1936"),
    archiveId: "the-plow-that-broke-the-plains-1936",
    subtitlePath: "/subtitles/the-plow-that-broke-the-plains.json",
    kind: "film",
  },
  {
    id: "plan-9-from-outer-space",
    title: "Plan 9 from Outer Space",
    year: 1959,
    language: "English",
    languageCode: "en",
    rating: "PG",
    description:
      "Ed Wood's UFO-graveyard cult classic: stock footage, cardboard tombstones, and earnest narration—often called the best worst film ever made.",
    videoUrl: iaFile("plan-9-from-outer-space", "plan-9-from-outer-space.mp4"),
    posterUrl: iaPoster("plan-9-from-outer-space"),
    archiveId: "plan-9-from-outer-space",
    subtitlePath: "/subtitles/plan-9-from-outer-space.json",
    kind: "film",
  },
  {
    id: "his-girl-friday",
    title: "His Girl Friday",
    year: 1940,
    language: "English",
    languageCode: "en",
    rating: "PG",
    description:
      "Howard Hawks's screwball remake of The Front Page: Cary Grant and Rosalind Russell trade barbs at breakneck newsroom speed.",
    videoUrl: iaFile("his_girl_friday", "his_girl_friday.mp4"),
    posterUrl: iaPoster("his_girl_friday"),
    archiveId: "his_girl_friday",
    subtitlePath: "/subtitles/his-girl-friday.json",
    kind: "film",
  },
  {
    id: "house-on-haunted-hill",
    title: "House on Haunted Hill",
    year: 1959,
    language: "English",
    languageCode: "en",
    rating: "PG-13",
    description:
      "William Castle's haunted-house gimmick horror: Vincent Price offers cash to guests who survive the night—sharp shadows on a low budget.",
    videoUrl: iaFile("house_on_haunted_hill_ipod", "house_on_haunted_hill.mp4"),
    posterUrl: iaPoster("house_on_haunted_hill_ipod"),
    archiveId: "house_on_haunted_hill_ipod",
    subtitlePath: "/subtitles/house-on-haunted-hill.json",
    kind: "film",
  },
  {
    id: "reefer-madness",
    title: "Reefer Madness",
    year: 1938,
    language: "English",
    languageCode: "en",
    rating: "PG-13",
    description:
      "Exploitation cautionary tale about marihuana that became a midnight-movie joke—wild performances and earnest moral panic.",
    videoUrl: iaFile("reefer_madness1938", "reefer_madness1938.mp4"),
    posterUrl: iaPoster("reefer_madness1938"),
    archiveId: "reefer_madness1938",
    subtitlePath: "/subtitles/reefer-madness.json",
    kind: "film",
  },
  {
    id: "sita-sings-the-blues",
    title: "Sita Sings the Blues",
    year: 2008,
    language: "English",
    languageCode: "en",
    rating: "PG-13",
    description:
      "Nina Paley's animated musical weaves the Ramayana with personal story and jazz—released under a Creative Commons license.",
    videoUrl: iaFile("sita-sings-the-blues", "sita-sings-the-blues.mp4"),
    posterUrl: iaPoster("sita-sings-the-blues"),
    archiveId: "sita-sings-the-blues",
    subtitlePath: "/subtitles/sita-sings-the-blues.json",
    kind: "film",
  },
];

export function getMovieById(id: string): Movie | undefined {
  return MOVIES.find((m) => m.id === id);
}
