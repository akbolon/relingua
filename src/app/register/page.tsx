"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";

export default function RegisterPage() {
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
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div>
          <div className="rule-ornament mb-4 max-w-xs" aria-hidden>
            <span className="opacity-50">·</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Already registered?{" "}
            <Link href="/login" className="link-accent font-medium underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input rounded-lg border border-white/35 bg-white/50 px-3 py-2.5 text-slate-900 outline-none ring-sky-500 focus:ring-2 dark:border-slate-500/45 dark:bg-slate-800/75 dark:text-slate-50 dark:placeholder:text-slate-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">Email</span>
              <input
                type="email"
                required
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
                minLength={8}
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
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
