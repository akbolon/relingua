/**
 * Generates timed subtitle JSON (opening scenes) for catalog titles.
 * Run from repo root: node scripts/seed-catalog-subtitles.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public", "subtitles");

function round2(x) {
  return Math.round(x * 100) / 100;
}

function silenceAfterCue(index) {
  if (index <= 0) return 0;
  if (index % 7 === 0) return round2(4.2 + (index % 3) * 0.35);
  if (index % 3 === 0) return round2(1.55);
  return round2(0.75);
}

function readDurationSec(words) {
  const n = words.length;
  const chars = words.map((w) => w.t).join(" ").length;
  const t = 2.2 + n * 0.42 + chars * 0.034;
  return Math.min(16, Math.max(2.4, t));
}

function mergeShortCues(cues) {
  const out = [];
  let i = 0;
  while (i < cues.length) {
    const a = cues[i];
    const next = cues[i + 1];
    if (
      next &&
      a.words.length <= 6 &&
      next.words.length <= 6 &&
      a.words.length + next.words.length <= 14
    ) {
      const joined = [...a.words, ...next.words]
        .map((w) => w.t)
        .join(" ");
      if (joined.length < 120) {
        out.push({ words: [...a.words, ...next.words] });
        i += 2;
        continue;
      }
    }
    out.push({ words: [...a.words] });
    i += 1;
  }
  return out;
}

function buildFile(locale, offset, rawCues) {
  const merged = mergeShortCues(rawCues);
  let t = offset;
  const cues = [];
  for (let i = 0; i < merged.length; i++) {
    const words = merged[i].words;
    const dur = readDurationSec(words);
    const gap = i === 0 ? 0 : silenceAfterCue(i);
    t += gap;
    const start = t;
    const end = t + dur;
    cues.push({
      start: round2(start),
      end: round2(end),
      words,
    });
    t = end;
  }
  return { locale, cues };
}

/** Each entry: raw cue lines (split into words with en gloss). */
const DATA = {
  "m-1931.json": {
    locale: "de",
    offset: 88,
    lines: [
      [
        ["Warte", "Wait"],
        ["—", "—"],
        ["hallo,", "hello,"],
        ["was", "what"],
        ["ist", "is"],
        ["denn", "then"],
        ["das?", "that?"],
      ],
      [
        ["Ich", "I"],
        ["habe", "have"],
        ["keine", "no"],
        ["Zeit.", "time."],
      ],
      [
        ["Alle", "Everyone"],
        ["sucht", "is looking for"],
        ["den", "the"],
        ["Mörder.", "murderer."],
      ],
      [
        ["Wer", "Who"],
        ["ist", "is"],
        ["der", "the"],
        ["Mann", "man"],
        ["mit", "with"],
        ["der", "the"],
        ["Pfeife?", "whistle?"],
      ],
      [
        ["Ruhe", "Quiet"],
        ["bitte!", "please!"],
      ],
      [
        ["Die", "The"],
        ["Polizei", "police"],
        ["ist", "is"],
        ["überall.", "everywhere."],
      ],
    ],
  },
  "the-blue-angel.json": {
    locale: "de",
    offset: 72,
    lines: [
      [
        ["Herr", "Mr."],
        ["Professor,", "Professor,"],
        ["guten", "good"],
        ["Tag.", "day."],
      ],
      [
        ["Die", "The"],
        ["Studenten", "students"],
        ["warten", "are waiting"],
        ["schon.", "already."],
      ],
      [
        ["Lola,", "Lola,"],
        ["singen", "sing"],
        ["Sie", "—"],
        ["heute", "today"],
        ["Abend?", "evening?"],
      ],
      [
        ["Natürlich,", "Of course,"],
        ["meine", "my"],
        ["Herren.", "gentlemen."],
      ],
      [
        ["Das", "That"],
        ["ist", "is"],
        ["ein", "a"],
        ["wunderbarer", "wonderful"],
        ["Abend.", "evening."],
      ],
    ],
  },
  "detour-1945.json": {
    locale: "en",
    offset: 12,
    lines: [
      [
        ["I", "I"],
        ["was", "was"],
        ["lucky,", "lucky,"],
        ["in", "in"],
        ["a", "a"],
        ["way.", "way."],
      ],
      [
        ["I", "I"],
        ["didn't", "didn't"],
        ["know", "know"],
        ["then", "then"],
        ["what", "what"],
        ["was", "was"],
        ["coming.", "coming."],
      ],
      [
        ["Fate,", "Fate,"],
        ["or", "or"],
        ["some", "some"],
        ["mysterious", "mysterious"],
        ["force,", "force,"],
        ["can", "can"],
        ["put", "put"],
        ["the", "the"],
        ["finger", "finger"],
        ["on", "on"],
        ["you", "you"],
        ["or", "or"],
        ["on", "on"],
        ["me,", "me,"],
        ["for", "for"],
        ["no", "no"],
        ["good", "good"],
        ["reason", "reason"],
        ["at", "at"],
        ["all.", "all."],
      ],
      [
        ["You", "You"],
        ["ever", "ever"],
        ["heard", "heard"],
        ["of", "of"],
        ["Al", "Al"],
        ["Roberts?", "Roberts?"],
      ],
      [
        ["Watch", "Watch"],
        ["yourself.", "yourself."],
      ],
    ],
  },
  "night-of-the-living-dead.json": {
    locale: "en",
    offset: 118,
    lines: [
      [
        ["They", "They"],
        ["ought", "ought"],
        ["to", "to"],
        ["make", "make"],
        ["the", "the"],
        ["day", "day"],
        ["the", "the"],
        ["time", "time"],
        ["changes", "changes"],
        ["the", "the"],
        ["first", "first"],
        ["day", "day"],
        ["of", "of"],
        ["summer.", "summer."],
      ],
      [
        ["What?", "What?"],
      ],
      [
        ["Well,", "Well,"],
        ["it", "it"],
        ["was", "was"],
        ["just", "just"],
        ["an", "an"],
        ["idea.", "idea."],
      ],
      [
        ["We've", "We've"],
        ["got", "got"],
        ["to", "to"],
        ["get", "get"],
        ["out", "out"],
        ["of", "of"],
        ["here.", "here."],
      ],
      [
        ["Don't", "Don't"],
        ["worry,", "worry,"],
        ["we'll", "we'll"],
        ["be", "be"],
        ["all", "all"],
        ["right.", "right."],
      ],
    ],
  },
  "third-man-1949.json": {
    locale: "en",
    offset: 95,
    lines: [
      [
        ["You", "You"],
        ["know", "know"],
        ["what", "what"],
        ["the", "the"],
        ["fellow", "fellow"],
        ["said", "said"],
        ["—", "—"],
        ["in", "in"],
        ["Italy,", "Italy,"],
        ["for", "for"],
        ["thirty", "thirty"],
        ["years", "years"],
        ["under", "under"],
        ["the", "the"],
        ["Borgias,", "Borgias,"],
        ["they", "they"],
        ["had", "had"],
        ["warfare,", "warfare,"],
        ["terror,", "terror,"],
        ["murder,", "murder,"],
        ["and", "and"],
        ["bloodshed,", "bloodshed,"],
        ["but", "but"],
        ["they", "they"],
        ["produced", "produced"],
        ["Michelangelo,", "Michelangelo,"],
        ["Leonardo", "Leonardo"],
        ["da", "da"],
        ["Vinci,", "Vinci,"],
        ["and", "and"],
        ["the", "the"],
        ["Renaissance.", "Renaissance."],
      ],
      [
        ["In", "In"],
        ["Switzerland", "Switzerland"],
        ["they", "they"],
        ["had", "had"],
        ["brotherly", "brotherly"],
        ["love.", "love."],
      ],
      [
        ["Harry", "Harry"],
        ["Lime?", "Lime?"],
      ],
      [
        ["The", "The"],
        ["third", "third"],
        ["man", "man"],
        ["—", "—"],
        ["who", "who"],
        ["was", "was"],
        ["he?", "he?"],
      ],
      [
        ["Look", "Look"],
        ["down", "down"],
        ["there.", "there."],
      ],
    ],
  },
  "the-plow-that-broke-the-plains.json": {
    locale: "en",
    offset: 28,
    lines: [
      [
        ["The", "The"],
        ["Great", "Great"],
        ["Plains", "Plains"],
        ["—", "—"],
        ["a", "a"],
        ["high", "high"],
        ["plateau", "plateau"],
        ["between", "between"],
        ["the", "the"],
        ["Mississippi", "Mississippi"],
        ["and", "and"],
        ["the", "the"],
        ["Rockies.", "Rockies."],
      ],
      [
        ["Here", "Here"],
        ["the", "the"],
        ["plains", "plains"],
        ["were", "were"],
        ["dry.", "dry."],
      ],
      [
        ["Drought", "Drought"],
        ["came", "came"],
        ["again", "again"],
        ["and", "and"],
        ["again.", "again."],
      ],
      [
        ["The", "The"],
        ["wind", "wind"],
        ["picked", "picked"],
        ["up", "up"],
        ["the", "the"],
        ["soil.", "soil."],
      ],
      [
        ["This", "This"],
        ["was", "was"],
        ["the", "the"],
        ["Dust", "Dust"],
        ["Bowl.", "Bowl."],
      ],
    ],
  },
  "plan-9-from-outer-space.json": {
    locale: "en",
    offset: 55,
    lines: [
      [
        ["Greetings,", "Greetings,"],
        ["my", "my"],
        ["friend.", "friend."],
      ],
      [
        ["We", "We"],
        ["are", "are"],
        ["all", "all"],
        ["interested", "interested"],
        ["in", "in"],
        ["the", "the"],
        ["future,", "future,"],
        ["for", "for"],
        ["that", "that"],
        ["is", "is"],
        ["where", "where"],
        ["you", "you"],
        ["and", "and"],
        ["I", "I"],
        ["are", "are"],
        ["going", "going"],
        ["to", "to"],
        ["spend", "spend"],
        ["the", "the"],
        ["rest", "rest"],
        ["of", "of"],
        ["our", "our"],
        ["lives.", "lives."],
      ],
      [
        ["Future", "Future"],
        ["events", "events"],
        ["such", "such"],
        ["as", "as"],
        ["these", "these"],
        ["will", "will"],
        ["affect", "affect"],
        ["you", "you"],
        ["in", "in"],
        ["the", "the"],
        ["future.", "future."],
      ],
      [
        ["You", "You"],
        ["see?", "see?"],
      ],
      [
        ["Stupid", "Stupid"],
        ["minds", "minds"],
        ["of", "of"],
        ["the", "the"],
        ["Earth.", "Earth."],
      ],
    ],
  },
  "his-girl-friday.json": {
    locale: "en",
    offset: 35,
    lines: [
      [
        ["Take", "Take"],
        ["me", "me"],
        ["with", "with"],
        ["you,", "you,"],
        ["Walter.", "Walter."],
      ],
      [
        ["You're", "You're"],
        ["wonderful,", "wonderful,"],
        ["Hildy.", "Hildy."],
      ],
      [
        ["What", "What"],
        ["do", "do"],
        ["you", "you"],
        ["want,", "want,"],
        ["a", "a"],
        ["cookie?", "cookie?"],
      ],
      [
        ["The", "The"],
        ["Morning", "Morning"],
        ["Post", "Post"],
        ["—", "—"],
        ["get", "get"],
        ["me", "me"],
        ["a", "a"],
        ["rewrite", "rewrite"],
        ["man!", "man!"],
      ],
      [
        ["Hello,", "Hello,"],
        ["baby!", "baby!"],
      ],
    ],
  },
  "house-on-haunted-hill.json": {
    locale: "en",
    offset: 42,
    lines: [
      [
        ["I", "I"],
        ["am", "am"],
        ["Frederick", "Frederick"],
        ["Loren.", "Loren."],
      ],
      [
        ["This", "This"],
        ["is", "is"],
        ["my", "my"],
        ["house.", "house."],
      ],
      [
        ["I", "I"],
        ["have", "have"],
        ["invited", "invited"],
        ["you", "you"],
        ["here", "here"],
        ["to", "to"],
        ["stay", "stay"],
        ["the", "the"],
        ["night.", "night."],
      ],
      [
        ["At", "At"],
        ["midnight", "midnight"],
        ["I", "I"],
        ["will", "will"],
        ["give", "give"],
        ["each", "each"],
        ["of", "of"],
        ["you", "you"],
        ["ten", "ten"],
        ["thousand", "thousand"],
        ["dollars.", "dollars."],
      ],
      [
        ["There's", "There's"],
        ["no", "no"],
        ["way", "way"],
        ["out.", "out."],
      ],
    ],
  },
  "reefer-madness.json": {
    locale: "en",
    offset: 25,
    lines: [
      [
        ["Marihuana", "Marijuana"],
        ["—", "—"],
        ["the", "the"],
        ["burning", "burning"],
        ["weed", "weed"],
        ["with", "with"],
        ["its", "its"],
        ["roots", "roots"],
        ["in", "in"],
        ["hell.", "hell."],
      ],
      [
        ["Tell", "Tell"],
        ["your", "your"],
        ["children!", "children!"],
      ],
      [
        ["This", "This"],
        ["plague", "plague"],
        ["will", "will"],
        ["spread,", "spread,"],
        ["unless", "unless"],
        ["we", "we"],
        ["stop", "stop"],
        ["it.", "it."],
      ],
      [
        ["The", "The"],
        ["deadly", "deadly"],
        ["narcotic", "narcotic"],
        ["—", "—"],
        ["marihuana!", "marijuana!"],
      ],
      [
        ["Don't", "Don't"],
        ["let", "let"],
        ["this", "this"],
        ["happen", "happen"],
        ["to", "to"],
        ["you.", "you."],
      ],
    ],
  },
  "sita-sings-the-blues.json": {
    locale: "en",
    offset: 18,
    lines: [
      [
        ["If", "If"],
        ["you", "you"],
        ["think", "think"],
        ["you're", "you're"],
        ["alone,", "alone,"],
        ["you're", "you're"],
        ["not.", "not."],
      ],
      [
        ["The", "The"],
        ["story", "story"],
        ["is", "is"],
        ["old,", "old,"],
        ["but", "but"],
        ["it", "it"],
        ["goes", "goes"],
        ["on.", "on."],
      ],
      [
        ["Love", "Love"],
        ["hurts.", "hurts."],
      ],
      [
        ["What", "What"],
        ["did", "did"],
        ["Rama", "Rama"],
        ["do", "do"],
        ["when", "when"],
        ["Sita", "Sita"],
        ["was", "was"],
        ["gone?", "gone?"],
      ],
      [
        ["The", "The"],
        ["gods", "gods"],
        ["watch", "watch"],
        ["from", "from"],
        ["above.", "above."],
      ],
    ],
  },
};

for (const [filename, spec] of Object.entries(DATA)) {
  const rawCues = spec.lines.map((line) => ({
    words: line.map(([t, en]) => ({ t, en })),
  }));
  const out = buildFile(spec.locale, spec.offset, rawCues);
  const p = path.join(pub, filename);
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + "\n", "utf8");
  const last = out.cues[out.cues.length - 1];
  console.log(filename, "cues:", out.cues.length, "ends ~", last.end);
}
