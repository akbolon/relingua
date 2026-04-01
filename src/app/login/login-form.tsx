"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/browse";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input rounded-lg border border-white/35 bg-white/50 px-3 py-2.5 text-slate-900 outline-none ring-sky-500 focus:ring-2 dark:border-slate-500/45 dark:bg-slate-800/75 dark:text-slate-50 dark:placeholder:text-slate-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input rounded-lg border border-white/35 bg-white/50 px-3 py-2.5 text-slate-900 outline-none ring-sky-500 focus:ring-2 dark:border-slate-500/45 dark:bg-slate-800/75 dark:text-slate-50 dark:placeholder:text-slate-400"
          />
        </label>
        {error ? (
          <p className="text-sm font-medium text-red-700 dark:text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3" aria-hidden>
        <div className="h-px flex-1 bg-white/35 dark:bg-slate-500/40" />
        <span className="text-xs tabular-nums tracking-wide text-muted">·</span>
        <div className="h-px flex-1 bg-white/35 dark:bg-slate-500/40" />
      </div>
      <button
        type="button"
        className="w-full rounded-lg border border-white/35 bg-white/25 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-white/40 dark:border-slate-500/40 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-700/60"
        onClick={() => signIn("google", { callbackUrl })}
      >
        Continue with Google
      </button>
    </div>
  );
}
