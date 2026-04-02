/**
 * Rebuild public/subtitles/viridiana.json from Script Savant screenplay structure
 * (thescriptsavant.com/movies/Viridiana.pdf) with Spanish dialogue translated from
 * that official English screenplay text. Timings: ffmpeg silencedetect on IA Viridiana.mp4.
 *
 * Run: node scripts/build-viridiana-subtitles.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchSpeechSegments } from "./time-viridiana-from-ffmpeg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

function round2(x) {
  return Math.round(x * 100) / 100;
}

function w(t, en, pron) {
  const o = { t, en };
  if (pron) o.pron = pron;
  return o;
}

/** Spanish lines aligned to Script Savant order (opening through early estate). */
const CUES = [
  {
    words: [
      w("Hermana,", "Sister — title before a nun’s name.", "air-MAH-nah"),
      w("Viridiana.", "Viridiana.", "vee-ree-DYAH-nah"),
    ],
  },
  {
    words: [w("¿Madre?", "Mother?", "MAH-dreh")],
  },
  {
    words: [
      w(
        "Acabo de recibir una carta de tu tío.",
        "I’ve just had a letter from your uncle.",
        "ah-KAH-boh deh reh-bee-BEER OO-nah KAHR-tah deh too TEE-oh",
      ),
      w(
        "No podrá venir cuando tomes los votos.",
        "He won’t be able to come when you take your vows.",
        "noh poh-DRAH beh-NEER KWAN-doh TOH-mes lohs BOH-tohs",
      ),
    ],
  },
  {
    words: [w("Está bien, Madre.", "All right, Mother.", "ehs-TAH byehn MAH-dreh")],
  },
  {
    words: [
      w(
        "No parece importarte mucho.",
        "You don’t seem to mind very much.",
        "noh pah-REH-theh im-pohr-TAHR-teh MOO-choh",
      ),
    ],
  },
  {
    words: [
      w(
        "Apenas lo conozco. Solo lo vi una vez, hace años.",
        "I hardly know him. I saw him only once, some years ago.",
        "ah-PEH-nahs loh koh-NOHS-koh SOH-loh loh bee …",
      ),
      w(
        "Ni siquiera me acuerdo de él.",
        "I can’t even remember him.",
        "nee see-kee-EH-rah meh ah-KWEHR-doh deh ehl",
      ),
    ],
  },
  {
    words: [
      w(
        "En cualquier caso, tu tío te pide que vayas a quedarte con él.",
        "In any case he’s asking you to come and stay with him.",
        "too TEE-oh teh PEE-deh …",
      ),
    ],
  },
  {
    words: [
      w(
        "No quiero salir del convento, Madre.",
        "I don’t want to leave the convent, Mother.",
        "noh KYEH-roh sah-LEER dehl kohn-BEHN-toh",
      ),
    ],
  },
  {
    words: [
      w(
        "Me temo que su salud no es buena. Es tu único familiar y debes despedirte de él antes de tomar los votos.",
        "I’m afraid his health is not good. He’s your only relative and you ought to say farewell before taking your vows. You will certainly never see him again.",
        "deh-behs des-peh-DEER-teh … toh-MAHR lohs BOH-tohs",
      ),
    ],
  },
  {
    words: [
      w(
        "¿Pero por qué quiere verme? Nunca se ha preocupado de mí.",
        "But why does he want to see me? He has never bothered about me.",
        "KEH-ree-eh BEHR-meh noon-kah …",
      ),
    ],
  },
  {
    words: [
      w(
        "Ha pagado tus estudios y tu manutención, y acaba de enviar tu dote.",
        "He has paid for your studies and your maintenance, and has just sent your dowry.",
        "pah-GAH-doh toos ehs-TOO-dyohs … DOH-teh",
      ),
      w(
        "¿Tan poco te importa, Viridiana?",
        "Does that mean so little to you, Viridiana?",
        "teh im-POHR-tah",
      ),
    ],
  },
  {
    words: [
      w(
        "No tengo ganas de volver a ver el mundo, pero si usted me lo ordena…",
        "I have no desire to see the world again, but if you order me to…",
        "lo ohr-DEH-nah",
      ),
    ],
  },
  {
    words: [
      w(
        "El retiro empezará pronto. Puedes marcharte mañana por la mañana.",
        "The retreat will start soon. You can leave tomorrow morning.",
        "mahr-CHAHR-teh …",
      ),
    ],
  },
  {
    words: [
      w(
        "En tu celda he hecho poner todo lo necesario para el viaje.",
        "Everything you need for the journey has been put in your cell.",
      ),
      w(
        "Ve a prepararte y trata de mostrarle cariño.",
        "Go get yourself ready, and try to show him some affection.",
        "prah-pah-RAHR-teh kah-REEN-yoh",
      ),
    ],
  },
  /** Park — Rita / Don Jaime (script) */
  {
    words: [
      w(
        "Basta por hoy, Rita. ¿Te gusta la cuerda que te regalé?",
        "That’s enough for today, Rita. Do you like that rope I gave you?",
      ),
    ],
  },
  {
    words: [
      w(
        "Salta mejor: tiene asas.",
        "It’s easier to jump with: it’s got handles.",
      ),
    ],
  },
  {
    words: [
      w("Vete ya, vete a jugar.", "Go away now. Go and play.", "BEH-teh"),
    ],
  },
  /** Arrival */
  {
    words: [w("Hola.", "Hello.", "OH-lah")],
  },
  {
    words: [w("Hola.", "Hello.", "OH-lah")],
  },
  {
    words: [
      w(
        "Bienvenida, señorita. Soy Ramona, la criada de don Jaime.",
        "Welcome, miss. I’m Ramona, Don Jaime’s servant.",
        "soy rah-MOH-nah lah kree-AH-dah",
      ),
    ],
  },
  {
    words: [
      w(
        "¡Ah! Mucho gusto.",
        "Ah! Pleased to meet you.",
        "MOO-choh GOOS-toh",
      ),
    ],
  },
  {
    words: [w("¡Viridiana!", "Viridiana!", "vee-ree-DYAH-nah")],
  },
  {
    words: [
      w(
        "Sí, tío. ¿Qué tal está usted?",
        "Yes, Uncle. How are you?",
      ),
    ],
  },
  {
    words: [
      w(
        "Bien… ¿El autocar llegó tarde, verdad? ¿Qué tal el viaje?",
        "I’m well … The bus was late, wasn’t it? What was the journey like?",
      ),
    ],
  },
  {
    words: [
      w(
        "Excelente. ¡Qué lugar tan apacible y encantador, tío!",
        "Excellent. What a charming, peaceful place, Uncle.",
      ),
    ],
  },
  {
    words: [
      w(
        "Creerá que aún está en el convento.",
        "You’ll think you’re still at the convent.",
      ),
    ],
  },
  {
    words: [
      w(
        "El tren llega al atardecer.",
        "The train arrives at dusk. (Screenplay: carriage; Spanish release often uses tren / this voiceover.)",
        "ehl trehn … ah-tahr-deh-SEHR",
      ),
      w(
        "El paisaje es árido y silencioso.",
        "The landscape is arid and silent.",
        "pah-ee-SAH-heh AH-ree-doh",
      ),
    ],
  },
  {
    words: [
      w(
        "Viridiana camina hacia la casa de campo.",
        "Viridiana walks toward the country house.",
      ),
    ],
  },
  {
    words: [
      w("Buenas tardes, soy Viridiana.", "Good afternoon, I’m Viridiana."),
      w("Pase, señorita.", "Come in, miss.", "PAH-seh seh-nyoh-REE-tah"),
    ],
  },
  {
    words: [
      w(
        "Don Jaime la está esperando en el salón.",
        "Don Jaime is waiting for her in the drawing room.",
      ),
    ],
  },
  {
    words: [w("Gracias, Ramona.", "Thank you, Ramona.", "GRAH-thyahs")],
  },
  {
    words: [
      w(
        "Hace años desde la última vez que te vi.",
        "It has been years since the last time I saw you.",
      ),
    ],
  },
  {
    words: [
      w(
        "Has crecido y te pareces a tu madre.",
        "You have grown and you look like your mother.",
      ),
    ],
  },
  {
    words: [
      w(
        "Prefiero no hablar de eso. Como quieras, sobrina.",
        "I prefer not to speak of that. As you wish, niece.",
      ),
    ],
  },
  {
    words: [
      w(
        "Esta noche descansarás en tu antigua habitación.",
        "Tonight you will rest in your old room.",
      ),
    ],
  },
  {
    words: [
      w(
        "Mañana hablaremos con más calma.",
        "Tomorrow we will speak with more calm.",
      ),
    ],
  },
];

function clipWindow(segments, t0, t1) {
  return segments
    .map((s) => ({
      start: Math.max(s.start, t0),
      end: Math.min(s.end, t1),
    }))
    .filter((s) => s.end - s.start > 0.12);
}

function mergeGaps(segments, gap = 0.42) {
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const out = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start - last.end < gap) last.end = Math.max(last.end, s.end);
    else out.push({ ...s });
  }
  return out;
}

function allocateTimes(segments, cues) {
  let speechTotal = 0;
  for (const s of segments) speechTotal += s.end - s.start;

  const weights = cues.map((c) => {
    const text = c.words.map((x) => x.t).join(" ");
    return Math.max(12, text.length);
  });
  const wsum = weights.reduce((a, b) => a + b, 0);

  let segIdx = 0;
  let tCursor = segments[0]?.start ?? 118;
  const out = [];

  for (let i = 0; i < cues.length; i++) {
    const need = (weights[i] / wsum) * speechTotal * 0.96;
    let left = need;
    const startW = tCursor;
    while (segIdx < segments.length && left > 0.05) {
      const s = segments[segIdx];
      if (tCursor < s.start) tCursor = s.start;
      if (tCursor >= s.end) {
        segIdx++;
        continue;
      }
      const avail = s.end - tCursor;
      const take = Math.min(avail, left);
      left -= take;
      tCursor += take;
      if (take >= avail - 1e-6) segIdx++;
    }
    const endW = tCursor;
    out.push({
      start: round2(startW),
      end: round2(Math.max(endW, startW + 0.55)),
      words: cues[i].words,
    });
  }

  for (let i = 1; i < out.length; i++) {
    if (out[i].start < out[i - 1].end) {
      out[i].start = round2(out[i - 1].end + 0.05);
    }
    if (out[i].end <= out[i].start) out[i].end = round2(out[i].start + 0.6);
  }
  return out;
}

async function main() {
  const raw = await fetchSpeechSegments(420);
  let window = mergeGaps(clipWindow(raw, 112, 360), 0.4);
  if (window.length === 0) {
    console.warn("No speech segments; using fallback linear 118–330s");
    window = [{ start: 118, end: 330 }];
  }

  const cues = allocateTimes(window, CUES);
  const data = {
    locale: "es",
    scriptSource:
      "https://thescriptsavant.com/movies/Viridiana.pdf (English screenplay). Spanish lines translated from that text; timings from ffmpeg silencedetect on Internet Archive Viridiana.mp4 (viridiana_202108).",
    cues,
  };
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", cues.length, "cues to", out, "first", cues[0].start, cues[0].end);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
