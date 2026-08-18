"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";

const DIRECT_EMAIL = "Doug@GameDayHuddle.com";

type Topic = "organization" | "general";

interface ContactFields {
  name: string;
  email: string;
  organization: string;
  teams: string;
  message: string;
  topic: Topic;
}

function readFields(form: HTMLFormElement, topic: Topic): ContactFields {
  const data = new FormData(form);
  const text = (field: string) => String(data.get(field) ?? "").trim();
  return {
    name: text("name"),
    email: text("email"),
    organization: text("organization"),
    teams: text("teams"),
    message: text("message"),
    topic,
  };
}

// An untouched optional field is left out of the request rather than sent empty,
// so the relay never has to decide what an empty string meant.
function requestBody(fields: ContactFields) {
  const body: Record<string, string> = { name: fields.name, email: fields.email, message: fields.message, topic: fields.topic };
  if (fields.organization) body.organization = fields.organization;
  if (fields.teams) body.teams = fields.teams;
  return body;
}

// Whatever the network does, the visitor keeps a way through: the same message,
// prepared in their own mail client, which they send themselves.
function draftEmail(fields: ContactFields) {
  const subject = fields.topic === "organization" ? "GameDay Huddle organization plan" : "GameDay Huddle question";
  const lines = [`Name: ${fields.name}`, `Email: ${fields.email}`];
  if (fields.organization) lines.push(`Organization: ${fields.organization}`);
  if (fields.teams) lines.push(`Teams: ${fields.teams}`);
  lines.push("", fields.message);
  return `mailto:${DIRECT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

// The site is exported as static HTML, so the query string only exists in the
// browser, and it cannot change without a full page load: nothing to subscribe to.
const subscribeToSearch = () => () => {};
const readSearch = () => window.location.search;
const noSearch = () => "";

export function ContactForm() {
  const search = useSyncExternalStore(subscribeToSearch, readSearch, noSearch);
  const topic: Topic = new URLSearchParams(search).get("topic") === "organization" ? "organization" : "general";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "draft">("idle");
  const [draftUrl, setDraftUrl] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const fields = readFields(form, topic);
    setReplyTo(fields.email);

    if (!endpoint) {
      setDraftUrl(draftEmail(fields));
      setStatus("draft");
      return;
    }

    setStatus("sending");
    try {
      // text/plain keeps this a CORS "simple request", so the browser sends no
      // preflight. The relay sits behind a proxy that answers OPTIONS itself
      // without CORS headers, which would otherwise block the form outright.
      // The body is still JSON; the relay parses it leniently.
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(requestBody(fields)),
      });
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      setStatus("sent");
    } catch {
      // The typed answers stay in the form as well, so a retry costs nothing.
      setDraftUrl(draftEmail(fields));
      setStatus("draft");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact-card contact-sent" role="status">
        <span className="section-kicker">Message sent</span>
        <h2>Thanks &mdash; this is with Doug.</h2>
        <p>Expect a reply at {replyTo}. Anything you forgot can go straight to <a href={`mailto:${DIRECT_EMAIL}`}>{DIRECT_EMAIL}</a>.</p>
      </div>
    );
  }

  return (
    <div className="contact-card">
      <span className="section-kicker">{topic === "organization" ? "Organization plan" : "Send a message"}</span>
      <h2>{topic === "organization" ? "Tell us about your program" : "Tell us what you need"}</h2>
      <p>{topic === "organization" ? "How many teams you run tells us most of what we need to set the plan up." : "Questions about the app, the plans, or getting a program started."}</p>
      {/* Scripts blocked: the submit handler never runs, so say so plainly
          rather than letting the default navigation swallow the message. */}
      <noscript>
        <p className="contact-status">
          This form needs JavaScript. Email{" "}
          <a href="mailto:Doug@GameDayHuddle.com">Doug@GameDayHuddle.com</a> instead
          and we will pick it up there.
        </p>
      </noscript>
      {/* method="post" so a no-script submit cannot put the typed message in
          the address bar. */}
      <form className="contact-form" method="post" onSubmit={submit}>
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required maxLength={120} placeholder="Coach Taylor" />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={180} placeholder="coach@school.org" />
        </label>
        <label>
          <span>Organization (optional)</span>
          <input name="organization" autoComplete="organization" maxLength={180} placeholder="Riverside Youth Football" />
        </label>
        <label>
          <span>Number of teams (optional)</span>
          <input name="teams" inputMode="numeric" maxLength={60} placeholder="8" />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" required maxLength={4000} rows={6} placeholder="What you coach, what you are trying to set up, and anything you want to know." />
        </label>
        <button className="button button-wide" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <div className="contact-status" aria-live="polite">
          {status === "sending" && "Sending your message…"}
          {status === "draft" && "Your message is ready in your own email. It does not reach Doug until you press send there."}
        </div>
        {status === "draft" && <a className="contact-draft" href={draftUrl}>Open the prepared email <span>→</span></a>}
      </form>
    </div>
  );
}
