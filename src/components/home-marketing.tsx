import { SUBSCRIPTION_PRICE_LABEL } from "@/lib/pricing";

export function HomeMarketing() {
  return (
    <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
      <section className="glass-panel rounded-3xl border border-white/50 p-8 shadow-lg dark:border-slate-500/35">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
          No ads
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          A calm place to watch and learn
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Relingua does not run display ads, sponsored lessons, or paywalls that interrupt playback. The
          interface stays focused on the film and the line you are learning.
        </p>
        <ul className="mt-6 space-y-4 text-sm leading-snug text-slate-800 dark:text-slate-100">
          <li className="flex gap-3 border-t border-white/40 pt-4 dark:border-slate-500/35">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sm font-semibold text-sky-800 dark:bg-sky-400/20 dark:text-sky-100"
              aria-hidden
            >
              1
            </span>
            <span>
              <strong className="font-medium text-slate-900 dark:text-slate-50">Original dialogue</strong>{" "}
              with word-by-word English glosses and optional pronunciation hints.
            </span>
          </li>
          <li className="flex gap-3 border-t border-white/40 pt-4 dark:border-slate-500/35">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-semibold text-indigo-900 dark:bg-indigo-400/20 dark:text-indigo-100"
              aria-hidden
            >
              2
            </span>
            <span>
              <strong className="font-medium text-slate-900 dark:text-slate-50">Curated cinema</strong> from
              the public domain and other rights-cleared sources — not an endless feed.
            </span>
          </li>
          <li className="flex gap-3 border-t border-white/40 pt-4 dark:border-slate-500/35">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-semibold text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100"
              aria-hidden
            >
              3
            </span>
            <span>
              <strong className="font-medium text-slate-900 dark:text-slate-50">Straightforward pricing</strong>{" "}
              so you can budget without comparing ten in-app “boost” SKUs.
            </span>
          </li>
        </ul>
      </section>

      <section className="flex flex-col justify-center rounded-3xl border border-sky-200/60 bg-gradient-to-br from-white/90 via-white/70 to-sky-50/80 p-8 shadow-lg dark:border-sky-900/40 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-sky-950/50">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-800 dark:text-sky-200">
          Value
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {SUBSCRIPTION_PRICE_LABEL} — built to undercut the usual stack
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          Big language apps often list premium tiers around seven to seventeen U.S. dollars per month
          (sometimes more for bundles). Relingua is intentionally priced lower so film-first learners
          are not paying for gamified economies you did not ask for.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-sky-200/50 bg-white/80 dark:border-slate-600/50 dark:bg-slate-950/60">
          <table className="w-full text-left text-sm">
            <caption className="border-b border-sky-100/80 px-4 py-3 text-left text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Illustrative comparison — retail pricing varies by region and promotion.
            </caption>
            <thead>
              <tr className="border-b border-sky-100/90 bg-sky-50/90 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                <th scope="col" className="px-4 py-3">
                  Product type
                </th>
                <th scope="col" className="px-4 py-3">
                  Typical premium (ballpark)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/80 text-slate-800 dark:divide-slate-700 dark:text-slate-100">
              <tr>
                <th scope="row" className="px-4 py-3 font-normal">
                  Large apps (Duolingo-style Super / Max–tier list prices)
                </th>
                <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                  often about $7–15/mo
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-normal">
                  Structured course apps (Babbel, Busuu–style subscriptions)
                </th>
                <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                  often about $10–17/mo
                </td>
              </tr>
              <tr className="bg-sky-100/50 font-medium dark:bg-sky-950/40">
                <th scope="row" className="px-4 py-3 text-slate-900 dark:text-slate-50">
                  Relingua full catalog
                </th>
                <td className="px-4 py-3 text-sky-900 dark:text-sky-100">
                  {SUBSCRIPTION_PRICE_LABEL} · no ads on the site
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
