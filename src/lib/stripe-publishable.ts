/**
 * Client-safe Stripe publishable key (`NEXT_PUBLIC_*` is inlined at build time).
 * Hosted Checkout (this app’s billing buttons) only uses server routes and does
 * not read this value. Use it when you add Stripe.js / Payment Element on the client.
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  return key && key.length > 0 ? key : "";
}
