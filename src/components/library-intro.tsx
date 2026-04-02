"use client";

import { useSession } from "next-auth/react";

export function LibraryIntro() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <p
        className="mt-2 h-5 max-w-2xl rounded-md bg-slate-300/40 animate-pulse dark:bg-slate-500/30"
        aria-hidden
      />
    );
  }

  return (
    <p className="mt-2 max-w-2xl text-sm text-muted">
      {status === "authenticated" ? "Choose a title to watch." : "Sign in to watch."}
    </p>
  );
}
