"use client";

import { useState } from "react";
import { SUBSCRIPTION_PRICE_LABEL } from "@/lib/pricing";

type Props = {
  hasCustomer: boolean;
  subscribed: boolean;
  /** When true, hide subscribe CTA; playback does not require a subscription. */
  devUnlimited?: boolean;
};

export function BillingButtons({ hasCustomer, subscribed, devUnlimited }: Props) {
  void process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  const [loading, setLoading] = useState<null | "sub" | "portal">(null);
  const [message, setMessage] = useState<string | null>(null);

  async function checkout() {
    setMessage(null);
    setLoading("sub");
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    setLoading(null);
    if (!res.ok) {
      setMessage(data.error ?? "Checkout unavailable. Configure Stripe keys and price id.");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function portal() {
    setMessage(null);
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    setLoading(null);
    if (!res.ok) {
      setMessage(data.error ?? "Billing portal unavailable.");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {devUnlimited && !subscribed ? (
        <p className="text-sm text-slate-700 dark:text-slate-200">
          No subscription is required to stream while developer access is on.
        </p>
      ) : null}
      {!subscribed && !devUnlimited ? (
        <button
          type="button"
          onClick={() => void checkout()}
          disabled={loading !== null}
          className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {loading === "sub" ? "Redirecting…" : `Subscribe (${SUBSCRIPTION_PRICE_LABEL})`}
        </button>
      ) : null}
      {hasCustomer ? (
        <button
          type="button"
          onClick={() => void portal()}
          disabled={loading !== null}
          className="glass-btn rounded-2xl px-4 py-2 text-sm"
        >
          {loading === "portal" ? "Opening…" : "Billing"}
        </button>
      ) : null}
      {message ? (
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
