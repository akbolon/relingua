import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { getWatchAccess } from "@/lib/access";
import { getMovieById } from "@/lib/movies";
import prisma from "@/lib/db";
import { WatchShell } from "./watch-shell";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/watch/" + id);

  const access = await getWatchAccess(session.user.id, movie.id);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const now = new Date();
  const subscribed =
    user?.subscriptionStatus === "active" &&
    user.subscriptionPeriodEnd &&
    user.subscriptionPeriodEnd > now;

  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {movie.language} · {movie.kind === "series" ? "Series" : "Film"} ·{" "}
              {movie.year}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              {movie.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              {movie.description}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              {movie.rating}
            </p>
            {movie.archiveId ? (
              <p className="mt-3 text-xs">
                <a
                  href={`https://archive.org/details/${movie.archiveId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link-accent inline-flex items-center gap-1 font-medium underline underline-offset-4"
                  aria-label="Internet Archive (opens in new tab)"
                >
                  <span aria-hidden>↗</span>
                </a>
              </p>
            ) : null}
          </div>
          <Link
            href="/browse"
            className="glass-btn inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-lg leading-none"
            aria-label="Back to library"
            title="Back to library"
          >
            ‹
          </Link>
        </div>

        {!access.allowed ? (
          <div className="glass-panel rounded-2xl p-6 text-center">
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              Subscription required
            </h2>
            <p className="mt-2 text-sm text-muted">
              Your complimentary title for this month is already set. Subscribe
              to stream the full catalog, or return next month for another
              complimentary pick.
            </p>
            <Link
              href="/account"
              className="mt-4 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              Billing
            </Link>
          </div>
        ) : (
          <>
            {!subscribed && access.via === "free_monthly" ? (
              <p className="mb-4 rounded-xl border border-amber-500/45 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/50 dark:bg-amber-950/50 dark:text-amber-100">
                You are using your one complimentary film for this calendar
                month. Playback will lock this title as your monthly pick when
                you press play.
              </p>
            ) : null}
            <WatchShell
              movieId={movie.id}
              src={movie.videoUrl}
              poster={movie.posterUrl}
              subtitleUrl={movie.subtitlePath}
              title={movie.title}
            />
          </>
        )}
      </main>
    </div>
  );
}
