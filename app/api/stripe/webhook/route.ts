import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { customers, subscriptions } from "../../../../db/schema";

type RuntimeEnv = { STRIPE_WEBHOOK_SECRET?: string };
type StripeEvent = { type: string; data: { object: Record<string, unknown> } };

function bytesToHex(bytes: Uint8Array) { return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""); }
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}

async function verifySignature(raw: string, signature: string, secret: string) {
  const values = Object.fromEntries(signature.split(",").map((part) => part.split("=", 2)));
  if (!values.t || !values.v1 || Math.abs(Date.now() / 1000 - Number(values.t)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${values.t}.${raw}`));
  return safeEqual(bytesToHex(new Uint8Array(digest)), values.v1);
}

export async function POST(request: Request) {
  const secret = (env as unknown as RuntimeEnv).STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature") ?? "";
  const raw = await request.text();
  if (!secret || !(await verifySignature(raw, signature, secret))) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(raw) as StripeEvent;
  const object = event.data.object;
  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const stripeCustomerId = String(object.customer ?? "");
    const details = object.customer_details as { email?: string; name?: string } | undefined;
    const email = details?.email?.toLowerCase();
    if (stripeCustomerId && email) {
      await db.insert(customers).values({ authUserId: String(object.client_reference_id ?? `stripe:${stripeCustomerId}`), email, name: details?.name ?? email, stripeCustomerId }).onConflictDoUpdate({ target: customers.email, set: { stripeCustomerId } });
    }
  }

  if (event.type.startsWith("customer.subscription.")) {
    const stripeCustomerId = String(object.customer ?? "");
    const stripeSubscriptionId = String(object.id ?? "");
    const [customer] = await db.select().from(customers).where(eq(customers.stripeCustomerId, stripeCustomerId)).limit(1);
    if (customer && stripeSubscriptionId) {
      const items = object.items as { data?: Array<{ price?: { product?: string } }> } | undefined;
      const stripeProductId = String(items?.data?.[0]?.price?.product ?? "unknown");
      await db.insert(subscriptions).values({ customerId: customer.id, stripeSubscriptionId, stripeProductId, plan: "coach", status: String(object.status ?? "unknown"), currentPeriodEnd: object.current_period_end ? new Date(Number(object.current_period_end) * 1000).toISOString() : null, cancelAtPeriodEnd: Boolean(object.cancel_at_period_end), updatedAt: new Date().toISOString() }).onConflictDoUpdate({ target: subscriptions.stripeSubscriptionId, set: { status: String(object.status ?? "unknown"), currentPeriodEnd: object.current_period_end ? new Date(Number(object.current_period_end) * 1000).toISOString() : null, cancelAtPeriodEnd: Boolean(object.cancel_at_period_end), updatedAt: new Date().toISOString() } });
    }
  }

  return Response.json({ received: true });
}
