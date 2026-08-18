import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";

// Two plans, two fixed terms: Coach is $99 for 5 months on one team,
// Organization is $399 for 12 months across unlimited teams. There is no
// trial - the term starts when the coach pays. The Stripe price objects
// behind these ids must carry the matching term when billing is configured.
type RuntimeEnv = { STRIPE_SECRET_KEY?: string; STRIPE_PRICE_COACH?: string; STRIPE_PRICE_ORGANIZATION?: string };

export async function POST(request: Request) {
  const runtime = env as unknown as RuntimeEnv;
  const payload = (await request.json().catch(() => ({}))) as { plan?: string };
  const priceId = payload.plan === "organization" ? runtime.STRIPE_PRICE_ORGANIZATION : payload.plan === "coach" ? runtime.STRIPE_PRICE_COACH : undefined;

  if (!runtime.STRIPE_SECRET_KEY || !priceId) {
    return Response.json({ error: "Secure checkout will open once launch pricing is configured." }, { status: 503 });
  }

  const user = await getChatGPTUser();
  const origin = new URL(request.url).origin;
  const body = new URLSearchParams({
    // Fixed terms, not recurring: the pages promise 5 months / 12 months and
    // never mention renewal, so checkout must not create a subscription that
    // silently renews. Both Stripe prices must be one-time prices.
    mode: "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    allow_promotion_codes: "true",
  });
  if (user?.email) body.set("customer_email", user.email);
  if (user?.userId) body.set("client_reference_id", user.userId);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${runtime.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const session = (await stripeResponse.json()) as { url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !session.url) return Response.json({ error: session.error?.message ?? "Checkout could not be created." }, { status: 502 });
  return Response.json({ url: session.url });
}
