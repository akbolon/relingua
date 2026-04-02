import { SiteHeader } from "@/components/site-header";
import { HomeHeroCta } from "@/components/home-hero-cta";

export default function HomePage() {
  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-16 sm:px-6">
        <section className="glass-panel relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-sky-400/20 dark:border-sky-400/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-4 left-8 text-6xl font-light leading-none text-sky-500/10 dark:text-sky-400/15"
            aria-hidden
          >
            ◇
          </div>
          <div className="rule-ornament mb-6 max-w-xs" aria-hidden>
            <span className="rule-ornament-dot">·</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Relingua
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Original-language dialogue · hover a word for an English gloss.
          </p>
          <HomeHeroCta />
        </section>
      </main>
    </div>
  );
}
