"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";

const SIGNUP_URL = "https://func-huddle-prod-idqzc6gkjd2cc.azurewebsites.net/api/signup";
const CODE_LENGTH = 12;

// Which door the coach came through. Founding a team and joining one are the
// same request with one field swapped, so they are one form, not two pages.
type Door = "found" | "join";

interface SignupResult {
  door: Door;
  teamName: string;
  entitlement: string;
  paidThrough: string | null;
}

// The server writes its own refusals — a code that is not a code, one already
// redeemed, one whose season is over — and they go on screen as written. The
// only decision here is where they land. The season refusal names itself in the
// body's `code`; the other two name the invite in the sentence. Everything else
// is about the account, and matching the bare word "code" would drag an
// unrelated refusal — an access code, a reset code — under the coach code.
const CODE_REFUSAL = /invite code|coach code/i;

function refusesTheCode(refusal: string, reason?: string) {
  return reason === "season_over" || CODE_REFUSAL.test(refusal);
}

function plainDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// A coach code is twelve digits read off a text message. Only digits survive
// typing or pasting, and they are shown in threes of four so a coach can check
// them against whatever they were sent; the request still carries the digits.
// The field is deliberately uncapped: a maxLength would have the browser
// truncate "Code: 1234 5678 9012" to fit before the digits could be read out of
// it, and a correct code would come up short.
function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

function grouped(digits: string) {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Where the caret belongs once so many digits have gone by. The spacing shifts
// as the code is typed, so the place has to be counted in digits: measured in
// characters, a correction lands beside the wrong one.
function caretAfter(value: string, digits: number) {
  if (digits <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] >= "0" && value[i] <= "9" && ++seen === digits) return i + 1;
  }
  return value.length;
}

// Organization plans are arranged with us on /contact, so the only account this
// page creates is a coach account: a head coach founding a team, or a coach the
// head coach invited joining theirs.
export function SignupFlow() {
  const [chosen, setChosen] = useState(false);
  const [door, setDoor] = useState<Door>("found");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [result, setResult] = useState<SignupResult | null>(null);
  const teamNameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  function focusFirstField(next: Door) {
    requestAnimationFrame(() => (next === "join" ? codeRef : teamNameRef).current?.focus());
  }

  // Both controls on the coach card open the same form. An invited coach has no
  // way to know that a card about founding a team is also his door, so the card
  // names his one directly and lands him on it.
  function choose(next: Door) {
    setChosen(true);
    setDoor(next);
    setError("");
    setCodeError("");
    focusFirstField(next);
  }

  // Selecting a door does not move focus. Arrow keys change the selection inside
  // a radio group, so focusing a field here would throw a keyboard user out of
  // the group on the first arrow press, before they had read the other option.
  function pick(next: Door) {
    setDoor(next);
    setError("");
    setCodeError("");
  }

  function typeCode(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const typed = input.value;
    const digits = onlyDigits(typed);
    const before = onlyDigits(typed.slice(0, input.selectionStart ?? typed.length)).length;
    // Re-grouping rewrites the field under the coach's hands, and a rewritten
    // field puts the caret at the end — so a corrected digit would be appended
    // rather than replaced, sending a wrong code that still counts twelve. The
    // grouped value and the caret go on together, and React re-renders the same
    // string it finds already there.
    const value = grouped(digits);
    input.value = value;
    const caret = caretAfter(value, Math.min(before, digits.length));
    input.setSelectionRange(caret, caret);
    setCode(digits);
    setCodeError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chosen || sending) return;

    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      accountType: "coach",
      displayName: String(form.get("displayName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    };

    // Both refusals belong to the attempt before this one, the banner included:
    // a server refusal about the account must not stay on screen beside a fresh
    // one about the code, pointing the coach at two different fields at once.
    setError("");
    setCodeError("");

    if (door === "join") {
      if (code.length !== CODE_LENGTH) {
        setCodeError(`A coach code is ${CODE_LENGTH} digits. Check the one you were given.`);
        codeRef.current?.focus();
        return;
      }
      // An invited coach founds nothing: the code decides which team they land
      // on, so no team name is sent — asking for one would be a promise the
      // account cannot keep.
      payload.inviteCode = code;
    } else {
      payload.name = String(form.get("name") ?? "").trim();
      const accessCode = String(form.get("accessCode") ?? "").trim();
      if (accessCode) payload.accessCode = accessCode;
    }

    setSending(true);

    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        teamId?: string;
        teamName?: string;
        entitlement?: string;
        paidThrough?: string | null;
        error?: string;
        code?: string;
      };
      if (response.status === 201 && data.teamId) {
        setResult({
          door,
          teamName: data.teamName ?? "",
          entitlement: data.entitlement ?? "none",
          paidThrough: data.paidThrough ?? null,
        });
      } else {
        const refusal = data.error || "Something went wrong on our side. Try again in a moment.";
        if (door === "join" && refusesTheCode(refusal, data.code)) {
          setCodeError(refusal);
          codeRef.current?.focus();
        } else {
          setError(refusal);
        }
      }
    } catch {
      setError("We couldn't reach the signup service. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (result) {
    const joined = result.door === "join";
    return (
      <div className="signup-flow">
        <div className="signup-success" role="status">
          <span className="section-kicker">{joined ? "You are on the staff" : "Account created"}</span>
          <h2>{joined ? `You joined ${result.teamName || "the team"} as a coach.` : "Your account is ready."}</h2>
          {joined && <p className="signup-joined">You did not start a team &mdash; you are a coach on that one. The head coach owns the playbook, the roster, and the season.</p>}
          {!joined && result.entitlement === "active" && result.paidThrough && (
            <p className="signup-covered">Your access code covered the first year &mdash; good through {plainDate(result.paidThrough)}.</p>
          )}
          <ol>
            <li><a href="/download">Download the app</a> on the Android tablet or phone you coach from.</li>
            <li>Sign in with the email and password you just created.</li>
            {joined && <li>Your head coach&apos;s playbook, roster, and schedule are already there. Nothing to set up.</li>}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className={chosen ? "signup-flow has-choice" : "signup-flow"}>
      <noscript>
        {/* Only the coach button needs JavaScript; the organization card is a plain link now. */}
        <style>{".signup-flow .signup-card button, .signup-flow .signup-card-note, .signup-flow .signup-form-card { display: none; }"}</style>
        <p className="signup-banner"><b>JavaScript needed</b> Creating an account happens right on this page, and it needs JavaScript. Open this same page in a browser with JavaScript turned on, or <a href="/contact">write to us</a> and we will get you started.</p>
      </noscript>
      <div className="signup-options">
        <article className={chosen ? "signup-card is-selected" : "signup-card"}>
          <span className="section-kicker">Coach only</span>
          <h2>One coach, one team</h2>
          <p>You are the program. Your playbook, roster, depth chart, and game logs belong to your sign-in, on your tablet.</p>
          <ul>
            <li>Set up your own team name and season</li>
            <li>Playbook, depth chart, roster, and schedule in one place</li>
            <li>Game day play calling with live stats, fully offline</li>
          </ul>
          <button className="button button-wide" type="button" aria-pressed={chosen} onClick={() => choose(door)}>Choose Coach Only</button>
          <p className="signup-card-note">Handed a code by your head coach? <button type="button" onClick={() => choose("join")}>Join their team</button> &mdash; same door, and there is no team for you to set up.</p>
        </article>
        <article className="signup-card">
          <span className="section-kicker">Organization</span>
          <h2>A program with staff</h2>
          <p>The organization owns the subscription and the billing, then invites each head coach to a team under it.</p>
          <ul>
            <li>One subscription covering every team</li>
            <li>Invite head coaches by email to join it</li>
            <li>Each coach signs in on their own tablet</li>
          </ul>
          <a className="button button-wide" href="/contact?topic=organization">Contact us to set it up</a>
        </article>
      </div>
      <div className="signup-form-card" hidden={!chosen}>
        <span className="section-kicker">Coach account</span>
        <h2>{door === "join" ? "Join your head coach" : "Set up your team"}</h2>
        <p>
          {door === "join"
            ? <>This creates the account you will sign in with inside the app. Coached with us last season? <a href="#returning">A new season&apos;s code comes through us</a> &mdash; do not sign up a second time.</>
            : "This creates the account you will sign in with inside the app."}
        </p>
        <form className="signup-form" onSubmit={submit}>
          <fieldset className="signup-door">
            <legend>Which one are you</legend>
            <div>
              <label className={door === "found" ? "is-on" : undefined}>
                <input type="radio" name="door" value="found" checked={door === "found"} onChange={() => pick("found")} />
                <span>I&apos;m starting a new team</span>
              </label>
              <label className={door === "join" ? "is-on" : undefined}>
                <input type="radio" name="door" value="join" checked={door === "join"} onChange={() => pick("join")} />
                <span>I was given a coach code</span>
              </label>
            </div>
          </fieldset>
          {door === "join" ? (
            <label>
              <span>Coach code</span>
              <input
                ref={codeRef}
                name="inviteCode"
                value={grouped(code)}
                onChange={typeCode}
                inputMode="numeric"
                autoComplete="off"
                required
                aria-invalid={codeError ? true : undefined}
                aria-describedby={codeError ? "coach-code-error" : "coach-code-hint"}
                className="signup-code"
                placeholder="1234 5678 9012"
              />
              {codeError
                ? <small className="signup-field-error" id="coach-code-error" role="alert">{codeError}</small>
                : <small id="coach-code-hint">Twelve digits from the head coach who invited you &mdash; an invite code, in some messages. It puts you on their team for this season. The Play Keeper&apos;s game code is a different one: eight digits, and it goes in the app.</small>}
            </label>
          ) : (
            <label>
              <span>Team name</span>
              <input ref={teamNameRef} name="name" required placeholder="Riverside Ravens" />
            </label>
          )}
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
          {door === "found" && (
            <label>
              <span>Access code (optional)</span>
              <input name="accessCode" autoComplete="off" />
              <small>Given to this season&apos;s founding coaches and programs &mdash; it covers your first year.</small>
            </label>
          )}
          {error && <p className="signup-error" role="alert"><b>That didn&apos;t go through</b> {error}</p>}
          <button className="button button-wide" type="submit" disabled={sending}>{sending ? "Creating your account…" : door === "join" ? "Join the team" : "Create account"}</button>
        </form>
      </div>
    </div>
  );
}
