"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function HomeHeroCta() {
  const { data, status } = useSession();
  const loading = status === "loading";
  const authed = status === "authenticated" && Boolean(data?.user);

  if (loading) {
    return (
      <div className="mt-10 flex flex-wrap items-center gap-3" aria-hidden>
        <div className="h-11 w-24 animate-pulse rounded-2xl bg-slate-300/50 dark:bg-slate-500/35" />
        <div className="h-11 w-28 animate-pulse rounded-2xl bg-slate-300/50 dark:bg-slate-500/35" />
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <Link
        href="/browse"
        className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-500 dark:shadow-sky-950/40"
      >
        Browse films
      </Link>
      {authed ? (
        <Link href="/account" className="glass-btn rounded-2xl px-5 py-2.5 text-sm font-medium">
          Account
        </Link>
      ) : (
        <>
          <Link
            href="/register"
            className="rounded-2xl border border-sky-500/50 bg-white/70 px-5 py-2.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:bg-white dark:border-sky-400/40 dark:bg-slate-800/80 dark:text-sky-100 dark:hover:bg-slate-800"
          >
            Sign up free
          </Link>
          <Link href="/login" className="glass-btn rounded-2xl px-5 py-2.5 text-sm font-medium">
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
