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
        Library
      </Link>
      {authed ? (
        <Link href="/account" className="glass-btn rounded-2xl px-5 py-2.5 text-sm font-medium">
          Account
        </Link>
      ) : (
        <Link href="/login" className="glass-btn rounded-2xl px-5 py-2.5 text-sm font-medium">
          Sign in
        </Link>
      )}
    </div>
  );
}
