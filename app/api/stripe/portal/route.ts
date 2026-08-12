import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { customers } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

type RuntimeEnv = { STRIPE_SECRET_KEY?: string };

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to manage billing securely." }, { status: 401 });
  const runtime = env as unknown as RuntimeEnv;
  if (!runtime.STRIPE_SECRET_KEY) return Response.json({ error: "Stripe billing is not configured yet." }, { status: 503 });

  const [customer] = await getDb().select().from(customers).where(eq(customers.email, user.email)).limit(1);
  if (!customer?.stripeCustomerId) return Response.json({ error: "No Stripe customer is linked to this account yet." }, { status: 404 });

  const origin = new URL(request.url).origin;
  const stripeResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${runtime.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ customer: customer.stripeCustomerId, return_url: `${origin}/account` }),
  });
  const session = (await stripeResponse.json()) as { url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !session.url) return Response.json({ error: session.error?.message ?? "Billing portal could not be opened." }, { status: 502 });
  return Response.json({ url: session.url });
}
