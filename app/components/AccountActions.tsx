"use client";

import { useState } from "react";

export function AccountActions() {
  const [notice, setNotice] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

  async function openPortal() {
    setNotice("Connecting to Stripe…");
    try {
      const response = await fetch(`${apiBaseUrl}/api/stripe/portal`, { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Stripe portal is not configured yet.");
      window.location.assign(data.url);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Stripe portal is not configured yet.");
    }
  }

  if (!apiBaseUrl) {
    const paymentHelp = "mailto:support@gamedayhuddle.com?subject=Request%20secure%20billing%20portal%20access&body=Please%20send%20me%20a%20secure%20link%20to%20update%20my%20payment%20method.%20I%20will%20not%20include%20card%20details%20in%20this%20email.";
    const cancellationHelp = "mailto:support@gamedayhuddle.com?subject=Subscription%20cancellation%20request&body=Please%20contact%20me%20about%20cancelling%20my%20GameDay%20Huddle%20subscription.";
    return (
      <div className="account-actions">
        <a className="button" href={paymentHelp}>Update payment method</a>
        <a className="button button-danger-ghost" href={cancellationHelp}>Cancel subscription</a>
        <p>Preview mode: these links open a support request. Never send card details by email.</p>
      </div>
    );
  }

  return (
    <div className="account-actions">
      <button className="button" type="button" onClick={openPortal}>Update payment method</button>
      <button className="button button-danger-ghost" type="button" onClick={openPortal}>Cancel subscription</button>
      {notice && <p aria-live="polite">{notice}</p>}
    </div>
  );
}
