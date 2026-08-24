"use client";

import { useState } from "react";

/**
 * The third self-serve door: tablets without an account. Hardware grants no
 * access, so nobody should have to create an account to buy a spare — the
 * server mints the checkout and Stripe collects the shipping address. With no
 * API behind the page (the static fallback), the door points at sign-up,
 * where the same order rides the account creation.
 */
export function TabletOrderCard() {
  const [tablets, setTablets] = useState(1);
  const [message, setMessage] = useState("");
  // The same base sign-up posts to — it already ends in /api.
  const apiBase = process.env.NEXT_PUBLIC_SIGNUP_API_BASE?.replace(/\/$/, "");

  async function buy() {
    setMessage("Opening secure checkout…");
    try {
      const response = await fetch(`${apiBase}/order/tablets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tablets }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url || !data.url.startsWith("https://checkout.stripe.com/")) {
        throw new Error(data.error || "Checkout is not available right now.");
      }
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout is not available right now.");
    }
  }

  return (
    <section className="tablet-order section-shell">
      <div className="tablet-order-inner">
        <div>
          <span className="section-kicker">Hardware</span>
          <h2>GameDay Huddle Tablet &mdash; $100</h2>
          <p>Set up and ready for game day, shipping added at checkout. Optional &mdash; the app runs on any compatible Android tablet, and the sign-in screen checks yours before you pay for anything.</p>
        </div>
        {apiBase ? (
          <div className="tablet-order-buy">
            <label>
              <span>How many</span>
              <select value={tablets} onChange={(e) => setTablets(Number(e.currentTarget.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button className="button" type="button" onClick={buy}>Buy tablets</button>
            {message && <span className="checkout-message" aria-live="polite">{message}</span>}
          </div>
        ) : (
          <div className="tablet-order-buy">
            <a className="button" href="/signup">Order with your account</a>
          </div>
        )}
      </div>
    </section>
  );
}
