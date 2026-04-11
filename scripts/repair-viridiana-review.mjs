/**
 * Content review pass for public/subtitles/viridiana.json: fix misaligned EN, empty ES,
 * and drop bogus repeated cues. Run: node scripts/repair-viridiana-review.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

const data = JSON.parse(fs.readFileSync(p, "utf8"));
const cues = data.cues;

/** Drop OCR/Whisper tail spam (wrong line repeated). */
const filtered = cues.filter((c) => c.start < 379.86);

function firstWordT(c) {
  return c.words?.[0]?.t ?? "";
}

function setCue(idx, t, en) {
  if (idx < 0 || idx >= filtered.length) return;
  filtered[idx].words = [{ t, en }];
}

/* --- Merge empty / split “Sí, tío…” block (indices after filter). --- */
const emptyIdx = filtered.findIndex((c) => (c.words[0]?.t ?? "").trim() === "");
if (emptyIdx >= 0) {
  const nextIdx = emptyIdx + 1;
  const nextT = filtered[nextIdx]?.words?.[0]?.t ?? "";
  if (nextT.includes("Cómo") || nextT.includes("cómo")) {
    setCue(
      emptyIdx,
      "Sí, tío. ¿Qué tal está usted?",
      "Yes, Uncle. How are you?",
    );
    filtered.splice(nextIdx, 1);
  } else {
    setCue(emptyIdx, "Sí, tío. ¿Qué tal está usted?", "Yes, Uncle. How are you?");
  }
}

/* Re-find index of ¿Cómo está after possible splice */
const comoIdx = filtered.findIndex((c) => /^¿Cómo está/i.test(firstWordT(c)));
if (comoIdx >= 0) {
  setCue(comoIdx, "¿Cómo está, tío?", "How are you, Uncle?");
}

const patches = [
  {
    match: (t) => t.startsWith("El retiro empezará"),
    t: "El retiro empezará pronto.",
    en: "The retreat will start soon.",
  },
  {
    match: (t) => t.startsWith("Así que puedes marcharte"),
    t: "Así que puedes marcharte mañana por la mañana.",
    en: "So you may leave tomorrow morning.",
  },
  {
    match: (t) => t.includes("En su celda encontrará"),
    t: "En tu celda he hecho poner todo lo necesario para el viaje.",
    en: "I’ve had everything necessary for the journey put in your cell.",
  },
  {
    match: (t) => t.includes("Procure ser afectuosa"),
    t: "Procure ser afectuosa con él.",
    en: "Try to be affectionate with him.",
  },
  {
    match: (t) => t.startsWith("Déjelo"),
    t: "Déjelo, señorita.",
    en: "Leave it, miss.",
  },
  {
    match: (t) => t.startsWith("Buenos días"),
    t: "Buenos días.",
    en: "Good morning.",
  },
  {
    match: (t) => t.startsWith("Ha pagado sus estudios"),
    t: "Ha pagado tus estudios y tu manutención, y acaba de enviar tu dote.",
    en: "He has paid for your studies and your maintenance, and he has just sent your dowry.",
  },
  {
    match: (t) => t.startsWith("¿Qué más quiere"),
    t: "¿Tan poco te importa, Viridiana?",
    en: "Does that mean so little to you, Viridiana?",
  },
  {
    match: (t) => t.startsWith("Vine por orden"),
    t: "Vine por orden de la superiora.",
    en: "I came on the mother superior’s orders.",
  },
  {
    match: (t) => t.startsWith("Tampoco te interesaba"),
    t: "Tampoco te interesaba verme",
    en: "You weren’t interested in seeing me either.",
  },
  {
    match: (t) => t.startsWith("que te lo tuvieron"),
    t: "que te lo tuvieron que ordenar.",
    en: "that they had to order you to.",
  },
  {
    match: (t) => t.startsWith("Le tengo respeto"),
    t: "Le tengo respeto y agradecimiento",
    en: "I respect him and I’m grateful",
  },
  {
    match: (t) => t.startsWith("porque en lo material"),
    t: "porque en lo material se lo debo todo.",
    en: "because materially I owe him everything.",
  },
  {
    match: (t) => t.startsWith("Pero en lo demás"),
    t: "Pero en lo demás...",
    en: "But otherwise…",
  },
  {
    match: (t) => t.startsWith("Ningún cariño"),
    t: "Ningún cariño humano.",
    en: "No human affection.",
  },
  {
    match: (t) => t.startsWith("Tienes muy abandonados"),
    t: "Tienes muy abandonados los campos, tío.",
    en: "You’ve let the fields go, Uncle.",
  },
  {
    match: (t) => t.startsWith("Desde hace 20"),
    t: "Desde hace 20 años,",
    en: "For twenty years now,",
  },
  {
    match: (t) => t.startsWith("las hierbas se han hecho"),
    t: "las hierbas se han hecho dueñas de todo.",
    en: "the weeds have taken over everything.",
  },
  {
    match: (t) => t.startsWith("Y en la casa"),
    t: "Y en la casa, aparte del primer piso,",
    en: "And in the house, except on the first floor,",
  },
  {
    match: (t) => t.startsWith("se reproducen muy bien"),
    t: "se reproducen muy bien las arañas.",
    en: "the spiders breed very well.",
  },
  {
    match: (t) => t.startsWith("Yo no se mentir"),
    t: "Yo no sé mentir, tío.",
    en: "I can’t lie, Uncle.",
  },
  {
    match: (t) => t.includes("Cómo te parece esa tu tía"),
    t: "¿Cómo te parece esa tu tía?",
    en: "What do you think of your aunt?",
  },
  {
    match: (t) => t.startsWith("Hasta el mismo modo"),
    t: "Hasta el mismo modo de andar.",
    en: "Even the way you walk.",
  },
  {
    match: (t) => t.startsWith("Ya lo sé, tío") && !t.includes("dicho"),
    t: "Ya lo sé, tío.",
    en: "I know, Uncle.",
  },
  {
    match: (t) => t.startsWith("Ya me lo ha dicho"),
    t: "Ya me lo ha dicho usted antes.",
    en: "You’ve told me that before.",
  },
  {
    match: (t) => t.startsWith("Hasta en la voz"),
    t: "Hasta en la voz también.",
    en: "Even in the voice.",
  },
  {
    match: (t) => t.startsWith("Solo tengo permiso"),
    t: "Solo me han dado permiso para quedarme unos días.",
    en: "I’ve only been given permission to stay a few days.",
  },
  {
    match: (t) => t.startsWith("¿Te costó mucho"),
    t: "¿Te costó mucho conseguirlo?",
    en: "Was it hard to get?",
  },
];

for (const c of filtered) {
  const t = firstWordT(c);
  if (!t) continue;
  const patch = patches.find((x) => x.match(t));
  if (patch) {
    c.words = [{ t: patch.t, en: patch.en }];
  }
}

data.cues = filtered;
const prev = String(data.scriptSource || "").replace(/\nContent review:[\s\S]*$/, "");
data.scriptSource =
  `${prev}\nContent review (2026-04): English lines corrected vs. Script Savant where needed; bogus repeated tail cues removed. Per-word glosses: video player + src/lib/es-learner-lexicon.ts. Run: node scripts/repair-viridiana-review.mjs`;

fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Wrote", filtered.length, "cues");
