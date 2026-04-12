import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { HomeHeroCta } from "@/components/home-hero-cta";
import { HomeMarketing } from "@/components/home-marketing";

const HERO_STILL =
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80";

export default function HomePage() {
  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <section className="order-2 lg:order-1">
            <div className="rule-ornament mb-6 max-w-xs" aria-hidden>
              <span className="rule-ornament-dot">·</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Learn from films,{" "}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-300">
                not from ad breaks
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              Original-language dialogue with hover glosses and pronunciation notes. A single, calm
              subscription — no banners, no interruptions.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-emerald-300/60 bg-emerald-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-100">
                No ads
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                The whole site stays sponsor-free.
              </span>
            </div>
            <HomeHeroCta />
          </section>
          <div className="relative order-1 lg:order-2">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-sky-400/25 via-transparent to-indigo-400/20 blur-2xl dark:from-sky-500/15 dark:to-indigo-500/15"
              aria-hidden
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/50 shadow-2xl ring-1 ring-slate-900/5 dark:border-slate-600/50 dark:ring-white/10">
              <Image
                src={HERO_STILL}
                alt="Film projector beam in a dark room, suggesting cinema and focus"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-900/10" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white/95 drop-shadow-md">
                Photo: cinema mood — your subtitles stay legible over the player, not lost in a feed.
              </p>
            </div>
          </div>
        </div>

        <HomeMarketing />
      </main>
    </div>
  );
}
