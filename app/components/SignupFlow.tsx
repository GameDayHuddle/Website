"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { SignupIcon, type SignupIconName } from "./SignupIcons";

// Production unless a build says otherwise, because the deployed site is the
// only thing that must never guess. The override exists so this form can be run
// against the dev sandbox — a sign-up creates a real account in a real
// directory, and trying the join-a-team door against production would leave one
// behind every time somebody checked the wording.
// Its own setting rather than the shared NEXT_PUBLIC_API_BASE_URL, which also
// decides whether the pricing page shows live checkout buttons or the static
// fallbacks GitHub Pages needs. Pointing sign-up at dev should not turn on a
// checkout that answers 503.
const SIGNUP_URL = `${
  process.env.NEXT_PUBLIC_SIGNUP_API_BASE?.replace(/\/$/, "") ||
  "https://func-huddle-prod-idqzc6gkjd2cc.azurewebsites.net/api"
}/signup`;
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

// What the account actually opens onto. Every line here is something the app
// does today: no messaging, no player statistics, and no promise of a device
// the app has never run on.
const AFTER: { icon: SignupIconName; title: string; body: string }[] = [
  { icon: "clipboard", title: "Build your playbook", body: "Draw offense and defense on a real field — formations, plays, and the hole each one hits." },
  { icon: "people", title: "Manage your team", body: "Roster, depth chart, schedule, and the whole season in one place." },
  { icon: "chart", title: "Track games and stats", body: "Record every snap as it happens. Every number on screen is derived from that log." },
  { icon: "tablets", title: "Bring your staff in", body: "Invite coaches with a code, and let a Play Keeper record from a second tablet." },
  { icon: "offline", title: "Coach without a signal", body: "Game day never waits on a network. Your tablet syncs once you are back on one." },
];

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
  const [door, setDoor] = useState<Door>("found");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [secretError, setSecretError] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [result, setResult] = useState<SignupResult | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const teamNameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const repeatRef = useRef<HTMLInputElement>(null);

  // The plan cards sit below the form now, so arriving at the field a card just
  // chose means travelling back up the page. Focus lands first without moving
  // anything, then the card is scrolled to as a whole — focusing alone would
  // jump the field to the top edge and cut off the heading that explains it.
  function focusFirstField(next: Door) {
    requestAnimationFrame(() => {
      (next === "join" ? codeRef : teamNameRef).current?.focus({ preventScroll: true });
      // Honour the same preference the stylesheet does: scrollIntoView takes its
      // behaviour from the argument, not from the reduced-motion media query.
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      cardRef.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    });
  }

  // Both controls on the coach card open the same form. An invited coach has no
  // way to know that a card about founding a team is also his door, so the card
  // names his one directly and lands him on it.
  function choose(next: Door) {
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

  // The combined order (three self-serve shapes: licence only, licence plus
  // tablets, tablets only). The licence box unchecks itself when an access
  // code is typed — the code already covers the season — and the server minting
  // the checkout is what keeps the money addressed by us, not the browser.
  const [buyLicence, setBuyLicence] = useState(true);
  const [tablets, setTablets] = useState(0);
  const [codeTyped, setCodeTyped] = useState(false);
  const licenceOn = buyLicence && !codeTyped;
  const orderTotal = (licenceOn ? 99 : 0) + tablets * 100;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const payload: Record<string, unknown> = {
      accountType: "coach",
      displayName: String(form.get("displayName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password,
    };

    // Every refusal belongs to the attempt before this one, the banner included:
    // a server refusal about the account must not stay on screen beside a fresh
    // one about the code, pointing the coach at two different fields at once.
    setError("");
    setCodeError("");
    setSecretError("");

    // The second password field is checked here and sent nowhere. It exists to
    // catch a typo in a value the coach cannot read back, before the account is
    // created around it and the app refuses the sign-in they meant to type.
    if (password !== String(form.get("repeatPassword") ?? "")) {
      setSecretError("Those two passwords are not the same. Type the one you want in both fields.");
      repeatRef.current?.focus();
      return;
    }

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
      // The order rides the same request; a server that predates it simply
      // ignores the field and the account is created without a checkout.
      if ((licenceOn && !accessCode) || tablets > 0) {
        payload.order = { coach: licenceOn && !accessCode, tablets };
      }
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
        checkoutUrl?: string | null;
        error?: string;
        code?: string;
      };
      if (response.status === 201 && data.teamId) {
        // Money next, account done: the server minted a Stripe checkout for
        // the order, and the card is typed there, never here. The account
        // survives an abandoned checkout — the app's own Buy button remains.
        if (typeof data.checkoutUrl === "string" && data.checkoutUrl.startsWith("https://checkout.stripe.com/")) {
          window.location.assign(data.checkoutUrl);
          return;
        }
        setResult({
          door,
          orderHeld: Boolean(payload.order),
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
          <span className="signup-badge signup-badge-lit"><SignupIcon name="shield" /></span>
          <span className="section-kicker">{joined ? "You are on the staff" : "Account created"}</span>
          <h2>{joined ? `You joined ${result.teamName || "the team"} as a coach.` : "Your account is ready."}</h2>
          {joined && <p className="signup-joined">You did not start a team &mdash; you are a coach on that one. The head coach owns the playbook, the roster, and the season.</p>}
          {!joined && result.orderHeld && (
            <p className="signup-covered">Checkout isn&apos;t open on the website yet &mdash; your order wasn&apos;t charged. Buy the season (and tablets) from Billing inside the app.</p>
          )}
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
    <div className="signup-flow">
      <noscript>
        {/* Only the form and the two buttons that aim it need JavaScript; the organization card is a plain link. */}
        <style>{".signup-flow .signup-form-card, .signup-flow .signup-card button, .signup-flow .signup-card-note { display: none; }"}</style>
        <p className="signup-banner"><b>JavaScript needed</b> Creating an account happens right on this page, and it needs JavaScript. Open this same page in a browser with JavaScript turned on, or <a href="/contact">write to us</a> and we will get you started.</p>
      </noscript>

      <div className="signup-top">
        <div className="signup-form-card" ref={cardRef}>
          <span className="signup-badge"><SignupIcon name="user" /></span>
          <h2>Create your account</h2>
          <p>
            {door === "join"
              ? <>Your coach code puts you on your head coach&apos;s team. Coached with us last season? <a href="#returning">A new season&apos;s code comes through us</a> &mdash; do not sign up a second time.</>
              : "This is the account you will sign in with inside the app, and the team it opens."}
          </p>
          <form className="signup-form" onSubmit={submit}>
            <label>
              <span>Your name</span>
              <input name="displayName" autoComplete="name" required placeholder="Coach Taylor" />
            </label>
            <label>
              <span>Email address</span>
              <input name="email" type="email" autoComplete="email" required placeholder="coach@school.org" />
            </label>
            <label>
              <span>Create password</span>
              <span className="signup-secret">
                <input name="password" type={showSecret ? "text" : "password"} minLength={8} autoComplete="new-password" required placeholder="At least 8 characters" />
                <button className="signup-peek" type="button" aria-pressed={showSecret} aria-label={showSecret ? "Hide password" : "Show password"} onClick={() => setShowSecret((on) => !on)}>
                  <SignupIcon name={showSecret ? "eyeOff" : "eye"} />
                </button>
              </span>
            </label>
            <label>
              <span>Confirm password</span>
              <span className="signup-secret">
                <input
                  ref={repeatRef}
                  name="repeatPassword"
                  type={showRepeat ? "text" : "password"}
                  minLength={8}
                  autoComplete="new-password"
                  required
                  placeholder="Type it again"
                  aria-invalid={secretError ? true : undefined}
                  aria-describedby={secretError ? "repeat-password-error" : undefined}
                />
                <button className="signup-peek" type="button" aria-pressed={showRepeat} aria-label={showRepeat ? "Hide password" : "Show password"} onClick={() => setShowRepeat((on) => !on)}>
                  <SignupIcon name={showRepeat ? "eyeOff" : "eye"} />
                </button>
              </span>
              {secretError && <small className="signup-field-error" id="repeat-password-error" role="alert">{secretError}</small>}
            </label>

            {/* The two doors this form really has. Organization is not among them:
                the server creates a coach account and nothing else, so a program
                buying for its teams is a conversation, not a third radio. */}
            <fieldset className="signup-door">
              <legend>I&apos;m signing up as</legend>
              <div>
                <label className={door === "found" ? "is-on" : undefined}>
                  <input type="radio" name="door" value="found" checked={door === "found"} onChange={() => pick("found")} />
                  <SignupIcon name="whistle" />
                  <span><b>Head coach</b><small>I&apos;m starting a new team</small></span>
                  <i aria-hidden="true" />
                </label>
                <label className={door === "join" ? "is-on" : undefined}>
                  <input type="radio" name="door" value="join" checked={door === "join"} onChange={() => pick("join")} />
                  <SignupIcon name="ticket" />
                  <span><b>Invited coach</b><small>I was given a coach code</small></span>
                  <i aria-hidden="true" />
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
              <>
                <label>
                  <span>Team name</span>
                  <input ref={teamNameRef} name="name" required placeholder="Riverside Ravens" />
                </label>
                <label>
                  <span>Access code (optional)</span>
                  <input name="accessCode" autoComplete="off" placeholder="Leave blank if you weren't given one" onChange={(e) => setCodeTyped(e.currentTarget.value.trim().length > 0)} />
                  <small>Given to this season&apos;s founding coaches and programs &mdash; it covers your first year.</small>
                </label>

                <fieldset className="signup-order">
                  <legend>Your order &mdash; one payment, on Stripe&apos;s secure page</legend>
                  <div className="signup-order-line">
                    <input
                      aria-label="Buy the Coach licence, $99"
                      type="checkbox"
                      checked={licenceOn}
                      disabled={codeTyped}
                      onChange={(e) => setBuyLicence(e.currentTarget.checked)}
                    />
                    <span><b>Coach licence &mdash; $99</b><small>{codeTyped ? "Covered by your access code." : "One team, five months from the day you pay. Nothing renews on its own."}</small></span>
                  </div>
                  <div className="signup-order-line">
                    <span className="signup-order-qty">
                      <b>GameDay Huddle Tablet &mdash; $100 each</b>
                      <small>Set up for game day. Optional &mdash; the app runs on any compatible Android tablet. Shipping is added at checkout.</small>
                    </span>
                    <select
                      aria-label="How many tablets"
                      value={tablets}
                      onChange={(e) => setTablets(Number(e.currentTarget.value))}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n === 0 ? "None" : String(n)}</option>)}
                    </select>
                  </div>
                  <p className="signup-order-total" aria-live="polite">
                    {orderTotal > 0
                      ? <>Due at checkout: <b>${orderTotal}</b>{tablets > 0 ? " + shipping" : ""}</>
                      : <>Nothing due now &mdash; you can buy the season later, inside the app.</>}
                  </p>
                </fieldset>
              </>
            )}

            {error && <p className="signup-error" role="alert"><b>That didn&apos;t go through</b> {error}</p>}
            <button className="button button-wide" type="submit" disabled={sending}>{sending ? "Creating your account…" : door === "join" ? "Join the team" : "Create my account"}</button>
          </form>
          {/* /login is not part of the published site — it belongs to the account
              portal, which has no host yet — so the only true sign-in door to
              name is the app itself. */}
          <p className="signup-signin">Already have an account? You sign in <a href="/download">inside the app</a>, not here.</p>
        </div>

        <aside className="signup-benefits">
          <h2>Once you sign up,<br />you can:</h2>
          <ul>
            {AFTER.map((item) => (
              <li key={item.title}>
                <span className="signup-benefit-icon"><SignupIcon name={item.icon} /></span>
                <span><b>{item.title}</b><small>{item.body}</small></span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="signup-ways">
        <p className="section-kicker">Two ways to run your program</p>
        <h2>Choose what works for you</h2>
        <div className="signup-options">
          <article className={door === "found" ? "signup-card is-selected" : "signup-card"}>
            <span className="signup-badge"><SignupIcon name="whistle" /></span>
            <span className="section-kicker">Coach only</span>
            <h3>One coach, one team</h3>
            <p>You are the program. Your playbook, roster, depth chart, and game logs belong to your sign-in, on your tablet.</p>
            <ul>
              <li>Set up your own team name and season</li>
              <li>Playbook, depth chart, roster, and schedule in one place</li>
              <li>Game day play calling with live stats, fully offline</li>
            </ul>
            <button className="button button-wide" type="button" aria-pressed={door === "found"} onClick={() => choose("found")}>Choose Coach Only</button>
            <p className="signup-card-note">Handed a code by your head coach? <button type="button" onClick={() => choose("join")}>Join their team</button> &mdash; same door, and there is no team for you to set up.</p>
          </article>

          <article className="signup-card">
            <span className="signup-badge"><SignupIcon name="people" /></span>
            <span className="section-kicker">Organization</span>
            <h3>A program with staff</h3>
            <p>The organization owns the plan and the billing, then invites each head coach to a team under it.</p>
            <ul>
              <li>One plan covering up to ten teams</li>
              <li>Invite head coaches by email to join it</li>
              <li>Each coach signs in on their own tablet</li>
            </ul>
            <a className="button button-wide" href="/contact?topic=organization">Contact us to set it up</a>
            <p className="signup-card-note">This one is arranged with us rather than bought on the page, so we can size it to your teams.</p>
          </article>

          <article className={door === "join" ? "signup-card signup-card-code is-selected" : "signup-card signup-card-code"}>
            <span className="signup-badge"><SignupIcon name="ticket" /></span>
            <span className="section-kicker">Have a code?</span>
            <h3>Join your team</h3>
            <p>Your head coach minted you a twelve-digit code. It puts you on their team for this season.</p>
            <ul>
              <li>Nothing to set up &mdash; you join theirs</li>
              <li>Their playbook, roster, and schedule are already there</li>
              <li>You see the whole season; the head coach edits it</li>
            </ul>
            <button className="button button-wide" type="button" aria-pressed={door === "join"} onClick={() => choose("join")}>Join your team</button>
            <p className="signup-card-note">You still create a sign-in of your own &mdash; the code decides which team it lands on.</p>
          </article>
        </div>
      </div>
    </div>
  );
}
