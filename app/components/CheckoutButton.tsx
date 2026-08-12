"use client";

import { useState } from "react";

export function CheckoutButton({ plan, children }: { plan: "coach_monthly" | "coach_annual"; children: React.ReactNode }) {
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setMessage("Opening secure checkout…");
    try {
      const response = await fetch("/api/stripe/checkout", {
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

  return (
    <div className="checkout-action">
      <button className="button button-wide" type="button" onClick={startCheckout}>
        {children}
      </button>
      {message && <span className="checkout-message" aria-live="polite">{message}</span>}
    </div>
  );
}
