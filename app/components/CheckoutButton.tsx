"use client";

import { useState } from "react";

export function CheckoutButton({ plan, children }: { plan: "coach" | "organization"; children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

  async function startCheckout() {
    setMessage("Opening secure checkout…");
    try {
      const response = await fetch(`${apiBaseUrl}/api/stripe/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout is not configured yet.");
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout is not configured yet.");
    }
  }

  // Static hosting has no checkout API. Send buyers to sign-up rather than
  // straight to the free APK, which would read as "this plan costs nothing".
  if (!apiBaseUrl) {
    return (
      <div className="checkout-action">
        <a className="button button-wide" href="/signup">{children}</a>
      </div>
    );
  }

  return (
    <div className="checkout-action">
      <button className="button button-wide" type="button" onClick={startCheckout}>
        {children}
      </button>
      {message && <span className="checkout-message" aria-live="polite">{message}</span>}
    </div>
  );
}
