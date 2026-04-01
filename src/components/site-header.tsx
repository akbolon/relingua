"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const { data } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-white/25 dark:border-slate-500/25">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        >
          <span className="font-light text-sky-600 dark:text-sky-400" aria-hidden>
            ◇
          </span>
          <span>Relingua</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <Link
            href="/browse"
            className="rounded-lg px-3 py-1.5 text-sm text-slate-800 hover:bg-white/35 dark:text-slate-100 dark:hover:bg-white/10"
          >
            Library
          </Link>
          {data?.user ? (
            <>
              <Link
                href="/account"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-800 hover:bg-white/35 dark:text-slate-100 dark:hover:bg-white/10"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="glass-btn rounded-lg px-3 py-1.5 text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="glass-btn rounded-lg px-3 py-1.5 text-sm">
              Sign in
            </Link>
          )}
          {mounted ? (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-1 inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-slate-800 backdrop-blur-md dark:border-slate-500/35 dark:bg-slate-800/50 dark:text-slate-100"
              aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
            >
              <span className="text-lg leading-none" aria-hidden>
                {theme === "dark" ? "◐" : "◑"}
              </span>
            </button>
          ) : (
            <span className="h-8 w-20 rounded-lg border border-transparent" />
          )}
        </nav>
      </div>
    </header>
  );
}
