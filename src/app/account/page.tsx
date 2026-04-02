import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import prisma from "@/lib/db";
import { isDevUnlimitedEmail } from "@/lib/access";
import { BillingButtons } from "./billing-buttons";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const now = new Date();
  const subscribed =
    user?.subscriptionStatus === "active" &&
    user.subscriptionPeriodEnd &&
    user.subscriptionPeriodEnd > now;

  const devUnlimited = isDevUnlimitedEmail(user?.email ?? session.user?.email);

  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rule-ornament mb-4 max-w-xs" aria-hidden>
          <span className="rule-ornament-dot">·</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Account
        </h1>
        <p className="mt-2 text-sm text-muted">
          <span className="font-medium text-slate-800 dark:text-slate-100">{session.user.email}</span>
        </p>

        {devUnlimited ? (
          <div
            className="mt-8 rounded-2xl border border-emerald-500/45 bg-emerald-50/90 px-5 py-4 shadow-sm dark:border-emerald-400/40 dark:bg-emerald-950/45"
            role="status"
            aria-label="Developer access active"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white dark:bg-emerald-500">
                Developer
              </span>
              <span className="text-sm font-medium text-emerald-950 dark:text-emerald-100">
                Developer access is on
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-emerald-950/90 dark:text-emerald-50/95">
              The full catalog is unlocked for this account. There is no monthly “one film” limit, and
              nothing is locked behind a subscription for playback. Use this for building and testing
              the app.
            </p>
          </div>
        ) : null}

        <section className="glass-panel mt-8 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-200">
            {devUnlimited ? "Subscription & billing" : "Subscription"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
            {subscribed ? (
              <>
                You have an active subscription. Unlimited streaming across the catalog until{" "}
                {user?.subscriptionPeriodEnd?.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                .
              </>
            ) : devUnlimited ? (
              <>
                You are not on a paid plan. That is expected: developer access already gives full
                streaming. The buttons below are only if you want to test Stripe billing or manage an
                existing customer record.
              </>
            ) : (
              <>
                You are on the complimentary tier: one film per calendar month.
                Subscribe for twenty U.S. dollars per month to unlock the full
                library anytime.
              </>
            )}
          </p>
          {!devUnlimited && user?.freeMovieMonth ? (
            <p className="mt-3 text-xs text-muted">
              Complimentary: {user.freeMovieMonth}
              {user.freeMovieId ? ` · ${user.freeMovieId}` : ""}
            </p>
          ) : null}
          {devUnlimited && user?.freeMovieMonth ? (
            <p className="mt-3 text-xs text-muted">
              Monthly pick (ignored while developer access is on): {user.freeMovieMonth}
              {user.freeMovieId ? ` · ${user.freeMovieId}` : ""}
            </p>
          ) : null}
          <div className="mt-6">
            <BillingButtons
              hasCustomer={Boolean(user?.stripeCustomerId)}
              subscribed={subscribed ?? false}
              devUnlimited={devUnlimited}
            />
          </div>
        </section>

        <p className="mt-8 text-sm">
          <Link
            href="/browse"
            className="link-accent inline-flex min-h-9 min-w-9 items-center justify-center rounded-2xl border border-transparent text-lg leading-none underline-offset-4 hover:underline"
            aria-label="Back to library"
            title="Back to library"
          >
            ‹
          </Link>
        </p>
      </main>
    </div>
  );
}
