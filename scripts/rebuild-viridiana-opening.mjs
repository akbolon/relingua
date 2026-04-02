/**
 * @deprecated Do not run — overwrites hand-synced timings for Internet Archive Viridiana.mp4.
 * Kept for history only. Opening cues are aligned with ffmpeg silencedetect on that file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

function round2(x) {
  return Math.round(x * 100) / 100;
}

const data = JSON.parse(fs.readFileSync(p, "utf8"));
const old = data.cues;
const DELTA = round2(147 - old[2].start);

const cueHermana = {
  start: 119.5,
  end: 126.5,
  words: [
    {
      t: "Hermana,",
      en: "Sister (nun) — [air-MAH-nah]. Spanish for ‘Sister’ (religious); Italian cognate sorella = sister. Title used before a nun’s name, like ‘Sister Viridiana’ in English.",
    },
    {
      t: "Viridiana.",
      en: "Viridiana — [vee-ree-dee-AH-nah]. Her given name, from Latin viridis (‘green’); used here with Hermana as ‘Sister Viridiana’.",
    },
  ],
};

const cueCaridad = {
  start: 126.5,
  end: round2(126.5 + (old[0].end - old[0].start)),
  words: [
    {
      t: "La",
      en: "The — [lah]. Feminine singular article before caridad.",
    },
    {
      t: "caridad",
      en: "charity — [kah-ree-DAHD]. Christian love, almsgiving; not only ‘charity’ in the modern sense but concrete care for others.",
    },
    {
      t: "que",
      en: "that / which — [keh]. Relative pronoun linking to practicamos.",
    },
    {
      t: "practicamos",
      en: "we practice — [prahk-tee-KAH-mohs]. First-person plural of practicar (to practice, to carry out).",
    },
    {
      t: "aquí",
      en: "here — [ah-KEE]. Locative adverb: in this convent / this place.",
    },
    {
      t: "no",
      en: "not — [noh]. Negation before debe ser.",
    },
    {
      t: "debe",
      en: "must / ought to — [DEH-beh]. Third person of deber: it should, it must.",
    },
    {
      t: "ser",
      en: "to be — [sehr]. Infinitive after debe (must be).",
    },
    {
      t: "solo",
      en: "only — [SOH-loh]. Restricts what charity should be.",
    },
    {
      t: "abstracta.",
      en: "abstract — [ahb-STRAHK-tah]. Feminine singular adjective: not merely theoretical piety.",
    },
  ],
};

const cueAntes = {
  start: round2(cueCaridad.end + 0.5),
  end: round2(cueCaridad.end + 0.5 + (old[1].end - old[1].start)),
  words: [
    {
      t: "Antes",
      en: "Before — [AHN-tes]. Temporal adverb: prior to an event (here, before taking vows).",
    },
    {
      t: "de",
      en: "of / to — [deh]. Preposition linking to profesar.",
    },
    {
      t: "profesar,",
      en: "taking your vows — [proh-feh-SAHR]. To profess (religious vows); gerund sense in context: before you profess.",
    },
    {
      t: "quiero",
      en: "I want — [KYEH-roh]. First person of querer.",
    },
    {
      t: "que",
          en: "that — [keh]. Subordinating conjunction introducing a wish.",
    },
    {
      t: "cumplas",
      en: "you fulfill — [KOOM-plahs]. Subjunctive of cumplir: that you may fulfill.",
    },
    {
      t: "una",
      en: "a — [OO-nah]. Indefinite article (feminine).",
    },
    {
      t: "última",
      en: "final — [OOL-tee-mah]. Last in a series.",
    },
    {
      t: "misión",
      en: "mission — [mee-SYOHN]. Task or duty entrusted to her.",
    },
    {
      t: "de",
      en: "of — [deh].",
    },
    {
      t: "caridad.",
      en: "charity — [kah-ree-DAHD]. Same root as earlier caridad; a mission of love / service.",
    },
  ],
};

const rest = old.slice(2).map((c) => ({
  ...c,
  start: round2(c.start + DELTA),
  end: round2(c.end + DELTA),
}));

data.cues = [cueHermana, cueCaridad, cueAntes, ...rest];

fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Wrote", data.cues.length, "cues. DELTA for tail:", DELTA);
