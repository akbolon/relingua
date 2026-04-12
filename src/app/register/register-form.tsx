"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not register.");
      return;
    }
    const sign = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/browse",
    });
    if (sign?.error) {
      setError("Account created but sign-in failed. Try logging in.");
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <div className="glass-panel rounded-3xl border border-white/50 p-6 shadow-xl dark:border-slate-500/35 sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">Name (optional)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input rounded-xl border border-white/40 bg-white/60 px-3 py-2.5 text-slate-900 outline-none ring-2 ring-transparent transition focus:border-sky-400/60 focus:ring-sky-500/30 dark:border-slate-500/50 dark:bg-slate-900/60 dark:text-slate-50"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input rounded-xl border border-white/40 bg-white/60 px-3 py-2.5 text-slate-900 outline-none ring-2 ring-transparent transition focus:border-sky-400/60 focus:ring-sky-500/30 dark:border-slate-500/50 dark:bg-slate-900/60 dark:text-slate-50"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input rounded-xl border border-white/40 bg-white/60 px-3 py-2.5 text-slate-900 outline-none ring-2 ring-transparent transition focus:border-sky-400/60 focus:ring-sky-500/30 dark:border-slate-500/50 dark:bg-slate-900/60 dark:text-slate-50"
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
          className="mt-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:from-sky-500 hover:to-indigo-500 disabled:opacity-60 dark:shadow-sky-950/30"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-xs leading-relaxed text-muted">
          Already have an account?{" "}
          <Link href="/login" className="link-accent font-medium underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
