import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whSecret) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (userId && subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: sub.id,
              subscriptionStatus: sub.status === "active" ? "active" : "inactive",
              subscriptionPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          const active = sub.status === "active" || sub.status === "trialing";
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: active ? "active" : "inactive",
              subscriptionPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
              stripeSubscriptionId: sub.status === "canceled" ? null : sub.id,
            },
          });
        } else {
          const customerId =
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          if (customerId) {
            const user = await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
            });
            if (user) {
              const active = sub.status === "active" || sub.status === "trialing";
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  subscriptionStatus: active ? "active" : "inactive",
                  subscriptionPeriodEnd: sub.current_period_end
                    ? new Date(sub.current_period_end * 1000)
                    : null,
                },
              });
            }
          }
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const rawSub = invoice.subscription;
        const subId =
          typeof rawSub === "string"
            ? rawSub
            : rawSub && typeof rawSub === "object" && "id" in rawSub
              ? (rawSub as { id: string }).id
              : null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                subscriptionStatus: "active",
                subscriptionPeriodEnd: sub.current_period_end
                  ? new Date(sub.current_period_end * 1000)
                  : null,
              },
            });
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ received: true, error: true }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
