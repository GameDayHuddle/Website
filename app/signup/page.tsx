import type { Metadata } from "next";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";

export const metadata: Metadata = { title: "Sign up | GameDay Huddle", description: "Create a GameDay Huddle account for a single coach or for an entire football organization." };

export default function SignupPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="subpage-hero section-shell"><p className="section-kicker">Create your account</p><h1>Two ways to run <em>your program.</em></h1><p>Pick the shape of your account. A single coach runs everything from one sign-in; an organization holds the subscription and invites its coaches onto it.</p></section>
    <section className="signup-section section-shell">
      <p className="signup-banner"><b>Account creation opens soon.</b> Both paths are being built right now — the buttons below go live the moment they work. Nothing on this page creates an account yet.</p>
      <div className="signup-options">
        <article className="signup-card">
          <span className="section-kicker">Coach only</span>
          <h2>One coach, one team</h2>
          <p>You are the program. Your playbook, roster, depth chart, and game logs belong to your sign-in, on your tablet.</p>
          <ul>
            <li>Set up your own team name and season</li>
            <li>Playbook, depth chart, roster, and schedule in one place</li>
            <li>Game day play calling with live stats, fully offline</li>
          </ul>
          <button className="button button-wide" type="button" disabled aria-describedby="signup-soon-note">Choose Coach Only</button>
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
          <button className="button button-wide" type="button" disabled aria-describedby="signup-soon-note">Choose Organization</button>
        </article>
      </div>
      <p className="signup-footnote" id="signup-soon-note">Want in before the buttons work? <a href="/#organizations">Tell us about your program</a> and we will set you up as part of the early group, or <a href="/download">download the app</a> to see it first.</p>
    </section>
  </main><MarketingFooter /></div>;
}
