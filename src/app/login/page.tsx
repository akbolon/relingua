import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
        <div>
          <div className="rule-ornament mb-4 max-w-xs" aria-hidden>
            <span className="opacity-50">·</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted">
            Email · password · or Google. New here?{" "}
            <Link href="/register" className="link-accent font-medium underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
        <Suspense
          fallback={
            <div className="glass-panel h-48 animate-pulse rounded-2xl border border-white/20 dark:border-slate-500/25" />
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
