import Image from "next/image";

const STILLS = [
  {
    src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
    alt: "Dark cinema auditorium with light from the projector",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    alt: "Friends leaning in, as if watching a film together",
  },
  {
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    alt: "Laptop and notebook on a calm desk",
  },
] as const;

/**
 * Split-panel visuals for sign-in / register: real photography (Unsplash), no stock watermarks in UI.
 */
export function AuthShowcase({ heading }: { heading: string }) {
  return (
    <aside className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/40 bg-slate-900/5 p-6 shadow-inner dark:border-slate-500/35 dark:bg-slate-950/40 lg:min-h-[32rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25"
        style={{
          background:
            "radial-gradient(600px 280px at 20% 0%, rgba(56, 189, 248, 0.35), transparent), radial-gradient(500px 240px at 100% 100%, rgba(129, 140, 248, 0.3), transparent)",
        }}
        aria-hidden
      />
      <div className="relative z-[1]">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-700/90 dark:text-sky-300/90">
          Relingua
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          {heading}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          World cinema in the original language. Hover any word for English glosses and pronunciation
          notes. No ads anywhere on the site.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
          <li className="flex gap-2">
            <span className="mt-0.5 font-mono text-sky-600 dark:text-sky-400" aria-hidden>
              ✓
            </span>
            <span>Curated public-domain and rights-cleared films</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 font-mono text-sky-600 dark:text-sky-400" aria-hidden>
              ✓
            </span>
            <span>Built for learners, not ad inventory</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 font-mono text-sky-600 dark:text-sky-400" aria-hidden>
              ✓
            </span>
            <span>Simple subscription — see pricing on the home page</span>
          </li>
        </ul>
      </div>
      <div className="relative z-[1] mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        {STILLS.map((img) => (
          <div
            key={img.src}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/50 shadow-lg ring-1 ring-black/5 dark:border-slate-600/60 dark:ring-white/10"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 28vw, 33vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
