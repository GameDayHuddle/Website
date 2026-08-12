"use client";

import { FormEvent, useState } from "react";

export function LeadForm({ organization = false }: { organization?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Request failed");
      event.currentTarget.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <input type="hidden" name="source" value={organization ? "organization" : "android-beta"} />
      <label>
        <span>Name</span>
        <input name="name" autoComplete="name" required placeholder="Coach Taylor" />
      </label>
      <label>
        <span>Work email</span>
        <input name="email" type="email" autoComplete="email" required placeholder="coach@school.org" />
      </label>
      {organization && (
        <>
          <label>
            <span>Organization</span>
            <input name="organization" autoComplete="organization" required placeholder="Riverside Youth Football" />
          </label>
          <label>
            <span>Teams</span>
            <select name="teamCount" defaultValue="5">
              <option value="2">2–4 teams</option>
              <option value="5">5–9 teams</option>
              <option value="10">10–24 teams</option>
              <option value="25">25+ teams</option>
            </select>
          </label>
        </>
      )}
      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : organization ? "Talk to our team" : "Join the Android beta"}
      </button>
      <div className="form-status" aria-live="polite">
        {status === "success" && "You’re on the list. We’ll be in touch shortly."}
        {status === "error" && "We couldn’t save that yet. Email hello@gamedayhuddle.com and we’ll take care of it."}
      </div>
    </form>
  );
}
