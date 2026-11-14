"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { DEMO_EMAIL, DEMO_REQUEST_URL } from "./links";
import { sportNames } from "./sports";

// Doug, 14 Nov 2026: "Book a Demo" is a form — name, email, organization name, sports (pick
// any), state, best contact number and a message — that goes to his email. The visitor's
// email is the mail's Reply-To ("we need to add the email in the contact us"). It posts to the
// platform's own server, which emails him; no outside form service sees a club's details.
// If the send fails, the visitor can email the same words instead.

const sportOptions = [...sportNames, "Other"];

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
  "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

type DemoRequest = {
  name: string;
  email: string;
  organizationName: string;
  sports: string[];
  state: string;
  phone: string;
  message: string;
  website: string;
};

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; mailto: string };

function mailtoFor(request: DemoRequest) {
  const body = [
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Organization: ${request.organizationName}`,
    `Sports: ${request.sports.join(", ")}`,
    `State: ${request.state}`,
    `Best contact number: ${request.phone}`,
    "",
    request.message,
  ].join("\n");
  return `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(`Demo request: ${request.organizationName}`)}&body=${encodeURIComponent(body)}`;
}

export function DemoForm() {
  const [picked, setPicked] = useState<string[]>([]);
  const [sportsMissing, setSportsMissing] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function toggle(sport: string) {
    setSportsMissing(false);
    setPicked((current) => (current.includes(sport) ? current.filter((name) => name !== sport) : [...current, sport]));
  }

  async function submit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    if (status.kind === "sending") return;
    if (picked.length === 0) {
      setSportsMissing(true);
      return;
    }
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const request: DemoRequest = {
      name: field("name"),
      email: field("email"),
      organizationName: field("organizationName"),
      sports: sportOptions.filter((sport) => picked.includes(sport)),
      state: field("state"),
      phone: field("phone"),
      message: field("message"),
      website: field("website"),
    };
    setStatus({ kind: "sending" });
    try {
      const response = await fetch(DEMO_REQUEST_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "failed", mailto: mailtoFor(request) });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="demo-form demo-sent" role="status">
        <span className="icon-circle"><Icon name="check" strokeWidth={2.4} /></span>
        <h2>Thanks. We&rsquo;ll be in touch soon.</h2>
      </div>
    );
  }

  return (
    <form className="demo-form" onSubmit={submit} aria-label="Book a demo">
      <div className="demo-row">
        <label className="demo-field">
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required maxLength={100} />
        </label>
        <label className="demo-field">
          <span>Organization name</span>
          <input name="organizationName" type="text" autoComplete="organization" required maxLength={150} />
        </label>
      </div>
      <div className="demo-row">
        <label className="demo-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="demo-field">
          <span>Best contact number</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={7} maxLength={30} pattern="[0-9()+. -]{7,30}" />
        </label>
      </div>
      <fieldset className="demo-sports" aria-describedby={sportsMissing ? "demo-sports-missing" : undefined}>
        <legend>Sports</legend>
        <div className="demo-chips">
          {sportOptions.map((sport) => {
            const on = picked.includes(sport);
            return (
              <label className={on ? "demo-chip is-on" : "demo-chip"} key={sport}>
                <input type="checkbox" name="sports" value={sport} checked={on} onChange={() => toggle(sport)} />
                {on ? <Icon name="check" strokeWidth={2.6} /> : null}
                {sport}
              </label>
            );
          })}
        </div>
        {sportsMissing ? <p className="demo-error" id="demo-sports-missing" role="alert">Pick at least one sport.</p> : null}
      </fieldset>
      <div className="demo-row">
        <label className="demo-field">
          <span>State</span>
          <select name="state" required defaultValue="" autoComplete="address-level1">
            <option value="" disabled>Choose your state</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="demo-field">
        <span>Message</span>
        <textarea name="message" rows={5} maxLength={2000} />
      </label>
      <div className="demo-trap" aria-hidden="true">
        <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {status.kind === "failed" ? (
        <p className="demo-error" role="alert">
          It didn&rsquo;t send. <a href={status.mailto}>Email it to us instead</a>.
        </p>
      ) : null}
      <button className="button button-wide" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Submit"} <Icon name="arrow" strokeWidth={2.2} />
      </button>
    </form>
  );
}
