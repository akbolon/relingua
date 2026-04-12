import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AuthShowcase } from "@/components/auth-showcase";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 lg:mb-10">
          <div className="rule-ornament mb-4 max-w-xs" aria-hidden>
            <span className="rule-ornament-dot">·</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Email and password, or Google. New here?{" "}
            <Link href="/register" className="link-accent font-medium underline underline-offset-4">
              Create an account
            </Link>
            .
          </p>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <Suspense
            fallback={
              <div className="glass-panel h-64 animate-pulse rounded-3xl border border-white/30 dark:border-slate-500/25" />
            }
          >
            <LoginForm />
          </Suspense>
          <AuthShowcase heading="Same film. Same focus." />
        </div>
      </main>
    </div>
  );
}
