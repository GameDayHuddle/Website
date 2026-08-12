"use client";

import { useState } from "react";

export function AccountActions() {
  const [notice, setNotice] = useState("");

  async function openPortal() {
    setNotice("Connecting to Stripe…");
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Stripe portal is not configured yet.");
      window.location.assign(data.url);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Stripe portal is not configured yet.");
    }
  }

  return (
    <div className="account-actions">
      <button className="button" type="button" onClick={openPortal}>Update payment method</button>
      <button className="button button-danger-ghost" type="button" onClick={openPortal}>Cancel subscription</button>
      {notice && <p aria-live="polite">{notice}</p>}
    </div>
  );
}
