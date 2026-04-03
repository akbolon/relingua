/**
 * Rebuild public/subtitles/viridiana.json from Script Savant
 * (https://thescriptsavant.com/movies/Viridiana.pdf). English glosses (`en`) follow
 * that screenplay; Spanish (`t`) matches the Spanish soundtrack phrasing where it
 * differs. Timings: ffmpeg silencedetect on Internet Archive Viridiana.mp4.
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

/** Spanish + English aligned to Script Savant order through “You see, even the voice.” */
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
        "Me temo que su salud no es buena. Es tu único familiar y debes despedirte de él antes de tomar los votos. Desde luego no volverás a verle.",
        "I’m afraid that his health is not good. He’s your only relative and you ought to say farewell to him before taking your vows. You will certainly never see him again.",
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
        "He has paid for your studies and your maintenance, and he has just sent your dowry.",
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
        "Con ella se salta mejor: tiene mangos.",
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
  /** Walk to the house — not in earlier subtitle draft; from Script Savant PDF. */
  {
    words: [
      w(
        "¿Cuánto tiempo te vas a quedar?",
        "How long are you staying?",
      ),
    ],
  },
  {
    words: [
      w(
        "Muy poco tiempo, tío.",
        "A very short while, Uncle.",
      ),
      w(
        "Solo me han dado permiso para quedarme unos días.",
        "I’ve been given permission to stay only a few days.",
      ),
    ],
  },
  {
    words: [
      w(
        "¿Te fue difícil conseguirlo?",
        "Was that difficult to get?",
      ),
    ],
  },
  {
    words: [
      w(
        "No. La madre superiora me mandó venir.",
        "No. Mother Superior told me to come.",
      ),
    ],
  },
  {
    words: [
      w(
        "¿Tan poco interés tenía en verme?",
        "Did you have so little interest in seeing me?",
      ),
    ],
  },
  {
    words: [
      w(
        "A decir verdad, no mucho.",
        "To tell you the truth, not very much.",
      ),
      w(
        "No sé mentir.",
        "I cannot lie.",
      ),
      w(
        "Le tengo respeto y le agradezco todo lo material, pero por lo demás…",
        "I respect you and I am grateful to you because I owe you everything materially, but otherwise …",
      ),
    ],
  },
  {
    words: [
      w(
        "No siente usted ningún cariño hacia…",
        "You have no feelings toward …",
      ),
    ],
  },
  {
    words: [w("No.", "No.")],
  },
  {
    words: [
      w(
        "Tiene usted razón.",
        "You are right.",
      ),
      w(
        "Vivir solo me ha vuelto egoísta.",
        "Being alone has made me self-centered.",
      ),
    ],
  },
  {
    words: [
      w(
        "Lamento no habernos visto más.",
        "Now I am sorry we have not seen more of each other.",
      ),
      w(
        "Ya es demasiado tarde, ¿no es cierto?",
        "It’s too late, isn’t it?",
      ),
    ],
  },
  {
    words: [
      w(
        "Sí. Ya es demasiado tarde.",
        "Yes. It’s too late.",
      ),
    ],
  },
  {
    words: [
      w(
        "Ha descuidado usted la hacienda, tío.",
        "You’ve been neglecting the farm, Uncle.",
      ),
    ],
  },
  {
    words: [
      w(
        "En veinte años la hierba lo ha invadido todo.",
        "In twenty years the grass has invaded everything.",
      ),
      w(
        "Hay arañas por toda la casa, excepto en el primer piso.",
        "There are spiders all over the house except on the first floor.",
      ),
      w(
        "Casi nunca salgo.",
        "I hardly ever go out.",
      ),
    ],
  },
  {
    words: [
      w(
        "Es verdad. Cuando sale me hace saltar a la comba.",
        "It’s true. When he goes out he makes me jump rope.",
      ),
    ],
  },
  {
    words: [
      w(
        "Baja de ahí, pícara.",
        "Come down here, you scamp.",
      ),
    ],
  },
  {
    words: [w("¿Quién es?", "Who is she?")],
  },
  {
    words: [
      w(
        "Es la hija de mi doncella Ramona.",
        "My maid Ramona’s daughter.",
      ),
      w(
        "Es un animalito.",
        "She’s a little animal.",
      ),
    ],
  },
  {
    words: [w("Baja.", "Come down.")],
  },
  {
    words: [
      w(
        "Se parece usted mucho a su tía, hasta en el modo de andar.",
        "How like your aunt you are, even in your walk.",
      ),
    ],
  },
  {
    words: [
      w(
        "Ya lo sé, tío; ya me lo ha dicho usted.",
        "I know, Uncle, you’ve told me that already.",
      ),
    ],
  },
  {
    words: [
      w(
        "Hasta en la voz.",
        "You see, even the voice.",
      ),
    ],
  },
];

/**
 * IA `Viridiana.mp4`: Handel credits fade leaves a ~1.4s non-silent blip ~115.2–116.5s
 * that silencedetect treats as speech. First real line (“Hermana, Viridiana”) begins ~120s
 * (silence_end ~119.95s). Verified with multiple ffmpeg silencedetect passes (noise/d varied).
 */
function dropIaCreditsFalseSpeech(segments) {
  return segments.filter((s) => !(s.start < 118 && s.end < 118));
}

/** First dialogue + “¿Madre?” sit in detected speech ~120s and the following gap before ~125.84s. */
function pinOpeningConventToFilmClock(cues) {
  const line0Start = 120.0;
  const line0End = 121.02;
  /** One word; keep card short—silence until Mother Superior ~125.84s has no subs. */
  const line1End = 122.12;
  cues[0].start = round2(line0Start);
  cues[0].end = round2(line0End);
  cues[1].start = round2(line0End + 0.04);
  cues[1].end = round2(line1End);
  /** Measured silence_end before Mother Superior’s line on IA encode (~125.84s). */
  const motherSpeechStart = 125.8;
  const shift = round2(motherSpeechStart - cues[2].start);
  if (Math.abs(shift) < 0.02) return;
  for (let i = 2; i < cues.length; i++) {
    cues[i].start = round2(cues[i].start + shift);
    cues[i].end = round2(cues[i].end + shift);
  }
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end) {
      cues[i].start = round2(cues[i - 1].end + 0.05);
    }
    if (cues[i].end <= cues[i].start) {
      cues[i].end = round2(cues[i].start + 0.55);
    }
  }
}

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
  const raw = dropIaCreditsFalseSpeech(await fetchSpeechSegments(520));
  let window = mergeGaps(clipWindow(raw, 112, 480), 0.4);
  if (window.length === 0) {
    console.warn("No speech segments; using fallback linear 118–330s");
    window = [{ start: 118, end: 330 }];
  }

  const cues = allocateTimes(window, CUES);
  pinOpeningConventToFilmClock(cues);
  const data = {
    locale: "es",
    scriptSource:
      "https://thescriptsavant.com/movies/Viridiana.pdf — English glosses follow this screenplay; Spanish follows the film. Timings: ffmpeg silencedetect on https://archive.org/details/viridiana_202108 (Viridiana.mp4), ~112–480s; IA encode: drop ~115s false-speech blip; first line anchored at 2:00; convent opening aligned to silence map before Mother Superior at ~125.8s.",
    cues,
  };
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(
    "Wrote",
    cues.length,
    "cues;",
    "Hermana/Viridiana",
    cues[0].start,
    "–",
    cues[0].end,
    "¿Madre?",
    cues[1].start,
    "–",
    cues[1].end,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
