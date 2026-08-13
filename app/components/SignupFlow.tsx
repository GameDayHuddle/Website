"use client";

import { FormEvent, useRef, useState } from "react";

const SIGNUP_URL = "https://func-huddle-prod-idqzc6gkjd2cc.azurewebsites.net/api/signup";

type AccountType = "coach" | "organization";

interface SignupResult {
  teamId: string;
  accountType: AccountType;
  entitlement: string;
  paidThrough: string | null;
}

function plainDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function SignupFlow() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SignupResult | null>(null);
  const teamNameRef = useRef<HTMLInputElement>(null);
  const organization = accountType === "organization";

  function choose(type: AccountType) {
    setAccountType(type);
    setError("");
    requestAnimationFrame(() => teamNameRef.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountType || sending) return;
    setSending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const accessCode = String(form.get("accessCode") ?? "").trim();
    const payload: Record<string, string> = {
      accountType,
      name: String(form.get("name") ?? "").trim(),
      displayName: String(form.get("displayName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    };
    if (accessCode) payload.accessCode = accessCode;

    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as Partial<SignupResult> & { error?: string };
      if (response.status === 201 && data.teamId) {
        setResult({
          teamId: data.teamId,
          accountType: data.accountType === "organization" ? "organization" : "coach",
          entitlement: data.entitlement ?? "none",
          paidThrough: data.paidThrough ?? null,
        });
      } else {
        setError(data.error || "Something went wrong on our side. Try again in a moment.");
      }
    } catch {
      setError("We couldn't reach the signup service. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="signup-flow">
        <div className="signup-success" role="status">
          <span className="section-kicker">Account created</span>
          <h2>Your account is ready.</h2>
          {result.entitlement === "active" && result.paidThrough && (
            <p className="signup-covered">Your access code covered the first year — good through {plainDate(result.paidThrough)}.</p>
          )}
          <ol>
            <li><a href="/download">Download the app</a> on the Android tablet or phone you coach from.</li>
            <li>Sign in with the email and password you just created.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className={accountType ? "signup-flow has-choice" : "signup-flow"}>
      <noscript>
        <style>{".signup-flow .signup-card .button, .signup-flow .signup-form-card { display: none; }"}</style>
        <p className="signup-banner"><b>JavaScript needed</b> Creating an account happens right on this page, and it needs JavaScript. Open this same page in a browser with JavaScript turned on and both paths will work.</p>
      </noscript>
      <div className="signup-options">
        <article className={accountType === "coach" ? "signup-card is-selected" : "signup-card"}>
          <span className="section-kicker">Coach only</span>
          <h2>One coach, one team</h2>
          <p>You are the program. Your playbook, roster, depth chart, and game logs belong to your sign-in, on your tablet.</p>
          <ul>
            <li>Set up your own team name and season</li>
            <li>Playbook, depth chart, roster, and schedule in one place</li>
            <li>Game day play calling with live stats, fully offline</li>
          </ul>
          <button className="button button-wide" type="button" aria-pressed={accountType === "coach"} onClick={() => choose("coach")}>Choose Coach Only</button>
        </article>
        <article className={organization ? "signup-card is-selected" : "signup-card"}>
          <span className="section-kicker">Organization</span>
          <h2>A program with staff</h2>
          <p>The organization owns the subscription and the billing, then invites each head coach to a team under it.</p>
          <ul>
            <li>One subscription covering every team</li>
            <li>Invite head coaches by email to join it</li>
            <li>Each coach signs in on their own tablet</li>
          </ul>
          <button className="button button-wide" type="button" aria-pressed={organization} onClick={() => choose("organization")}>Choose Organization</button>
        </article>
      </div>
      <div className="signup-form-card" hidden={accountType === null}>
        <span className="section-kicker">{organization ? "Organization account" : "Coach account"}</span>
        <h2>{organization ? "Set up your program" : "Set up your team"}</h2>
        <p>This creates the account you will sign in with inside the app.</p>
        <form className="signup-form" onSubmit={submit}>
          <label>
            <span>{organization ? "Program name" : "Team name"}</span>
            <input ref={teamNameRef} name="name" required placeholder={organization ? "Riverside Youth Football" : "Riverside Ravens"} />
          </label>
          <label>
            <span>Your name</span>
            <input name="displayName" autoComplete="name" required placeholder="Coach Taylor" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required placeholder="coach@school.org" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" minLength={8} autoComplete="new-password" required />
            <small>At least 8 characters.</small>
          </label>
          <label>
            <span>Access code (optional)</span>
            <input name="accessCode" autoComplete="off" />
            <small>Given to this season&apos;s founding coaches and programs — it covers your first year.</small>
          </label>
          {error && <p className="signup-error" role="alert"><b>That didn&apos;t go through</b> {error}</p>}
          <button className="button button-wide" type="submit" disabled={sending}>{sending ? "Creating your account…" : "Create account"}</button>
        </form>
      </div>
    </div>
  );
}
