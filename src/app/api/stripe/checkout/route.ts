import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { getAppUrl, stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price is not configured." },
      { status: 500 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppUrl()}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppUrl()}/account`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkout.url });
}
