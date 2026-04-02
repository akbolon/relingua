import Image from "next/image";
import Link from "next/link";
import { LibraryIntro } from "@/components/library-intro";
import { SiteHeader } from "@/components/site-header";
import { MOVIES } from "@/lib/movies";

export default function BrowsePage() {
  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-10">
          <div className="rule-ornament mb-4 max-w-xs" aria-hidden>
            <span className="rule-ornament-dot">·</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Library
          </h1>
          <LibraryIntro />
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOVIES.map((m) => (
            <article
              key={m.id}
              className="glass-panel group flex flex-col overflow-hidden rounded-2xl transition hover:ring-2 hover:ring-sky-500/35 dark:hover:ring-sky-400/30"
            >
              <div className="relative aspect-video w-full bg-black/40">
                <Image
                  src={m.posterUrl}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/90">
                    {m.language}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs tabular-nums tracking-wide text-muted">
                  <span className="text-slate-700 dark:text-slate-200">{m.year}</span>
                  <span className="mx-1.5 text-slate-500 dark:text-slate-300">·</span>
                  <span>{m.rating}</span>
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {m.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                  {m.description}
                </p>
                <Link
                  href={`/watch/${m.id}`}
                  className="mt-4 inline-flex w-fit rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
                >
                  Watch
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
