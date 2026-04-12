import { SiteHeader } from "@/components/site-header";
import { AuthShowcase } from "@/components/auth-showcase";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="page-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 lg:mb-10">
          <div className="rule-ornament mb-4 max-w-xs" aria-hidden>
            <span className="rule-ornament-dot">·</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Join in a minute. Browse the library on the complimentary tier, or subscribe for the full
            catalog — still without ads anywhere on Relingua.
          </p>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <RegisterForm />
          <AuthShowcase heading="Pictures, not pop-ups" />
        </div>
      </main>
    </div>
  );
}
