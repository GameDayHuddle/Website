import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";

type RuntimeEnv = { STRIPE_SECRET_KEY?: string; STRIPE_PRICE_COACH_MONTHLY?: string; STRIPE_PRICE_COACH_ANNUAL?: string };

export async function POST(request: Request) {
  const runtime = env as unknown as RuntimeEnv;
  const payload = (await request.json().catch(() => ({}))) as { plan?: string };
  const priceId = payload.plan === "coach_annual" ? runtime.STRIPE_PRICE_COACH_ANNUAL : payload.plan === "coach_monthly" ? runtime.STRIPE_PRICE_COACH_MONTHLY : undefined;

  if (!runtime.STRIPE_SECRET_KEY || !priceId) {
    return Response.json({ error: "Secure checkout will open once launch pricing is configured." }, { status: 503 });
  }

  const user = await getChatGPTUser();
  const origin = new URL(request.url).origin;
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    "subscription_data[trial_period_days]": "7",
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
