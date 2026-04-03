/**
 * Build public/subtitles/viridiana.json from Whisper Spanish + English (translate) JSON.
 * Spanish timings from Whisper (base) on audio trimmed after Handel; English prefers
 * Script Savant lines, then time-matched translate (translate segments ≠ Spanish count).
 *
 * Prereqs: see repo comments in prior revisions (ffmpeg trim, whisper es + translate).
 *   node scripts/whisper-to-relingua-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ES_JSON = path.join(__dirname, "whisper-out-trim", "tmp-viridiana-asr-trim.json");
const EN_JSON = path.join(__dirname, "whisper-out-trim", "tmp-viridiana-translate.json");
const OUT = path.join(__dirname, "..", "public", "subtitles", "viridiana.json");

/** Trim start in the IA file (skip credits). */
const TRIM_OFFSET = 108;
/** Whisper’s first line vs. wall clock on this encode; with TRIM_OFFSET 108 → first cue ~2:00 after regen. */
const WALL_CLOCK_NUDGE = 10;

function round2(x) {
  return Math.round(x * 100) / 100;
}

/** English from Script Savant PDF where we can key it exactly (after fixSpanish). */
const EN_SCREENPLAY = {
  "Hermana Viridiana.": "Sister Viridiana.",
  "¿Madre?": "Mother?",
  "Acabo de recibir una carta de tu tío.": "I’ve just had a letter from your uncle.",
  "No puede venir a la profesión.": "He won’t be able to come when you take your vows.",
  "Está bien, Madre.": "All right, Mother.",
  "No parece importarte mucho.": "You don’t seem to mind very much.",
  "Casi no le conozco, sólo le vi una vez, hace años, ya ni me acuerdo, pues ahora le invita a su casa.":
    "I hardly know him. I saw him only once, some years ago. I can’t even remember him. Now he’s inviting you to his house.",
  "Preferiría no salir del convento, Madre.": "I’d prefer not to leave the convent, Mother.",
  "Me temo que no se encuentre bien.": "I’m afraid his health is not good.",
  "Es tu único familiar y debes despedirte de él antes de profesar.": "He’s your only relative and you ought to say farewell to him before taking your vows.",
  "Seguramente no volverás a verle.": "You will certainly never see him again.",
  "¿Por qué quiere que vaya?": "But why does he want to see me?",
  "Nunca se ha preocupado por mí.": "He has never bothered about me.",
  "Ha pagado sus estudios, la ha sostenido y acaba de enviar su dote.": "He has paid for your studies and your maintenance, and he has just sent your dowry.",
  "¿Qué más quiere?": "Does that mean so little to you, Viridiana?",
  "Mi deseo sería no volver a ver el mundo, pero si su reverencia me lo ordena.":
    "I have no desire to see the world again, but if you order me to…",
  "El retiro empezará pronto. Así que puedes marcharte mañana por la mañana.":
    "The retreat will start soon. You can leave tomorrow morning.",
  "En su celda encontrará todo lo necesario para el viaje.": "Everything you need for the journey has been put in your cell.",
  "Procure ser afectuosa con él.": "Go get yourself ready, and try to show him some affection.",
  "Ya está bien por hoy, Rita.": "That’s enough for today, Rita.",
  "Te gusta la cuerda que te he regalado.": "Do you like that rope I gave you?",
  "Se salta mejor porque tiene mangos.": "It’s easier to jump with: it’s got handles.",
  "Anda, vete a jugar.": "Go away now. Go and play.",
  "Déjelo, señorita.": "Hello.",
  "Buenos días.": "Hello.",
  "Hola.": "Hello.",
  "Bienvenida, señorita.": "Welcome, miss.",
  "Soy Ramona, la criada de Don Jaime.": "I’m Ramona, Don Jaime’s servant.",
  "Ah, mucho gusto.": "Ah! Pleased to meet you.",
  "Viridiana.": "Viridiana!",
  "¿Cómo está, tío?": "Yes, Uncle. How are you?",
  "Bien, bien.": "I’m well …",
  "Llegó el autocar tarde, ¿verdad?": "The bus was late, wasn’t it?",
  "¿Qué tal el viaje?": "What was the journey like?",
  "Muy bueno.": "Excellent.",
  "Qué lugar tan apacible, tío.": "What a charming, peaceful place, Uncle.",
  "Muy tranquilo.": "Very quiet.",
  "Creerá que aún estás en el convento.": "You’ll think you’re still at the convent.",
  "¿Cuánto tiempo te vas a quedar?": "How long are you staying?",
  "Muy poco, tío.": "A very short while, Uncle.",
  "Solo tengo permiso para unos días.": "I’ve been given permission to stay only a few days.",
  "¿Te costó mucho conseguirlo?": "Was that difficult to get?",
  "No.": "No.",
  "Vine por orden de la superiora.": "No. Mother Superior told me to come.",
  "Tampoco te interesaba verme que te lo tuvieron que ordenar.":
    "Did you have so little interest in seeing me?",
  "La verdad, no mucho.": "To tell you the truth, not very much.",
  "Yo no se mentir, tío.": "I cannot lie.",
  "Le tengo respeto y agradecimiento porque en lo material se lo debo todo.":
    "I respect you and I am grateful to you because I owe you everything materially, but otherwise …",
  "Pero en lo demás...": "You have no feelings toward …",
  "Ningún cariño humano.": "You have no feelings toward …",
  "Ninguno.": "No.",
  "Tiene razón.": "You are right.",
  "La soledad me ha vuelto egoísta.": "Being alone has made me self-centered.",
  "Ahora siento que no hayamos tenido más trato.": "Now I am sorry we have not seen more of each other.",
  "Demasiado tarde, ¿verdad?": "It’s too late, isn’t it?",
  "Sí.": "Yes.",
  "Demasiado tarde.": "It’s too late.",
  "Tienes muy abandonados los campos.": "You’ve been neglecting the farm, Uncle.",
  "Desde hace 20 años, las hierbas se han hecho dueñas de todo.":
    "In twenty years the grass has invaded everything.",
  "Y en la casa, aparte del primer piso,": "There are spiders all over the house except on the first floor.",
  "se reproducen muy bien las arañas.": "There are spiders all over the house except on the first floor.",
  "Apenas salgo al campo.": "I hardly ever go out.",
  "Es verdad.": "It’s true.",
  "Y cuando sale, me hace saltar a la comba.": "When he goes out he makes me jump rope.",
  "Ven aquí, perrito.": "Come down here, you scamp.",
  "¿Quién es?": "Who is she?",
  "Es la hija de Ramona, mi sirvienta.": "My maid Ramona’s daughter.",
  "¡Venga!": "Come down.",
  "Está hecha una salvaje.": "She’s a little animal.",
  "¿Cómo te parece esa tu tía?": "How like your aunt you are, even in your walk.",
  "Hasta el mismo modo de andar.": "How like your aunt you are, even in your walk.",
  "Ya lo sé, tío.": "I know, Uncle, you’ve told me that already.",
  "Ya me lo ha dicho usted antes.": "I know, Uncle, you’ve told me that already.",
  "Hasta en la voz.": "You see, even the voice.",
};

function fixSpanish(s) {
  let t = s.trim().replace(/\s+/g, " ");
  const pairs = [
    [/Hermana Viridiana,\s*acabo/gi, "Hermana Viridiana. Acabo"],
    [/Acabo de recibir carta de su tío/gi, "Acabo de recibir una carta de tu tío"],
    [/Acabo de recibir carta de tu tío/gi, "Acabo de recibir una carta de tu tío"],
    [/No parece sentirlo mucho su caridad/gi, "No parece importarte mucho"],
    [/Tengo que nos encuentre bien/gi, "Me temo que no se encuentre bien"],
    [
      /Es único para ir antes de despedirse de él antes de profesar/gi,
      "Es tu único familiar y debes despedirte de él antes de profesar",
    ],
    [/Seguramente no le verá más/gi, "Seguramente no volverás a verle"],
    [/me lo retena/gi, "me lo ordena"],
    [
      /Queda en pocos días para que empiece el retiro\.\s*Así que puede irse mañana mismo/gi,
      "El retiro empezará pronto. Así que puedes marcharte mañana por la mañana",
    ],
    [/mangoes/gi, "mangos"],
    [/Viridiano\./g, "Viridiana."],
    [/Con su permiso\.\s*/g, ""],
    [/Llegó a la otra buscón retras/gi, "Llegó el autocar tarde"],
    [/Qué bonito, sitio, tío/gi, "Qué lugar tan apacible, tío"],
    [/Te va a aparecer que sigues en el convento/gi, "Creerá que aún estás en el convento"],
    [/Bueno, ¿cuánto te vas a aquelar\?/gi, "¿Cuánto tiempo te vas a quedar?"],
    [/Te costo mucho/gi, "¿Te costó mucho"],
    [/Vine por orden de la superior\./g, "Vine por orden de la superiora."],
    [/se lo devote todo/gi, "se lo debo todo"],
    [/Ningún calor humano/gi, "Ningún cariño humano"],
    [/Tiene este muy abandonado en los campos/gi, "Tienes muy abandonados los campos"],
    [/duenas de todo/gi, "dueñas de todo"],
    [/Apenas algo al campo/gi, "Apenas salgo al campo"],
    [/me hace soltar/gi, "me hace saltar a la comba"],
    [/mis silbientas/gi, "mi sirvienta"],
    [/¡Denga!/g, "¡Venga!"],
    [/Ya me lo ha dicho este antes/gi, "Ya me lo ha dicho usted antes"],
    [/Lo ves, y la voz/gi, "Hasta en la voz"],
  ];
  for (const [re, rep] of pairs) t = t.replace(re, rep);
  return t.trim();
}

function shouldDropSegment(seg) {
  const txt = (seg.text || "").trim();
  if (!txt) return true;
  if (/jojo|joni-en|en-en-en/i.test(txt)) return true;
  if (/^¿Qué pasa\?$/i.test(txt) && (seg.no_speech_prob ?? 0) > 0.35) return true;
  if ((seg.compression_ratio ?? 0) > 10 && /^¿Qué pasa\?$/i.test(txt)) return true;
  return false;
}

function splitSentences(text) {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

function distributeTimes(start, end, n) {
  if (n <= 0) return [];
  const dur = Math.max(0.01, end - start);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = start + (dur * i) / n;
    const b = start + (dur * (i + 1)) / n;
    out.push({ start: a, end: b });
  }
  return out;
}

function usableEnPool(enSegs) {
  return enSegs.filter((e) => {
    const tx = (e.text || "").trim();
    if ((e.avg_logprob ?? 0) < -1.05) return false;
    if (/^bru speech$/i.test(tx)) return false;
    if (/^urmaine/i.test(tx)) return false;
    return true;
  });
}

function englishByTime(tMidRel, pool) {
  let best = "";
  let bestScore = Infinity;
  for (const e of pool) {
    if (tMidRel >= e.start && tMidRel <= e.end) {
      return (e.text || "").trim();
    }
    const em = (e.start + e.end) / 2;
    const d = Math.abs(em - tMidRel);
    if (d < bestScore) {
      bestScore = d;
      best = (e.text || "").trim();
    }
  }
  return best;
}

function englishForLine(spanishLine, tMidRel, enPool) {
  const key = spanishLine.trim();
  if (EN_SCREENPLAY[key]) return EN_SCREENPLAY[key];
  const fromWhisper = englishByTime(tMidRel, enPool);
  if (fromWhisper.length > 2) return fromWhisper;
  return "(English unavailable)";
}

function main() {
  const esData = JSON.parse(fs.readFileSync(ES_JSON, "utf8"));
  const enData = JSON.parse(fs.readFileSync(EN_JSON, "utf8"));
  const rawEs = esData.segments || [];
  const enPool = usableEnPool(enData.segments || []);

  const pairs = [];
  for (let i = 0; i < rawEs.length; i++) {
    if (shouldDropSegment(rawEs[i])) continue;
    pairs.push(rawEs[i]);
  }

  const cues = [];

  for (let i = 0; i < pairs.length; i++) {
    const seg = pairs[i];
    const fixed = fixSpanish(seg.text);
    let sentences = splitSentences(fixed);
    let times;

    if (
      i === 0 &&
      sentences.length >= 2 &&
      /^Hermana Viridiana\.?$/i.test(sentences[0].trim())
    ) {
      const dur = Math.max(0.05, seg.end - seg.start);
      const t0 = seg.start;
      const tMadre0 = t0 + dur * 0.12;
      const tMadre1 = tMadre0 + Math.min(1.15, dur * 0.08);
      const rest0 = tMadre1;
      const restPieces = sentences.slice(1);
      const restTimes = distributeTimes(rest0, seg.end, restPieces.length);
      times = [{ start: t0, end: tMadre0 }, { start: tMadre0, end: tMadre1 }, ...restTimes];
      sentences = [sentences[0], "¿Madre?", ...restPieces];
    } else {
      times = distributeTimes(seg.start, seg.end, sentences.length);
    }

    for (let j = 0; j < sentences.length; j++) {
      const relStart = times[j].start;
      const relEnd = times[j].end;
      const relMid = (relStart + relEnd) / 2;
      const start = round2(relStart + TRIM_OFFSET + WALL_CLOCK_NUDGE);
      const end = round2(relEnd + TRIM_OFFSET + WALL_CLOCK_NUDGE);
      const enLine = englishForLine(sentences[j], relMid, enPool);
      cues.push({
        start,
        end: Math.max(end, start + 0.35),
        words: [{ t: sentences[j], en: enLine }],
      });
    }
  }

  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end - 0.02) {
      cues[i].start = round2(cues[i - 1].end + 0.04);
    }
    if (cues[i].end <= cues[i].start) cues[i].end = round2(cues[i].start + 0.5);
  }

  const data = {
    locale: "es",
    scriptSource:
      "Spanish: OpenAI Whisper (base) on IA Viridiana.mp4 audio, ffmpeg trim from 1:48 (+108s) + 12s wall-clock nudge. English: Script Savant PDF where keyed; else Whisper translate segment time-matched. Spanish post-edited for ASR errors. Regenerate: node scripts/whisper-to-relingua-json.mjs",
    cues,
  };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", cues.length, "cues to", OUT);
}

main();
