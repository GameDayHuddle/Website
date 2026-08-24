import type { Metadata } from "next";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import { SignupFlow } from "../components/SignupFlow";
import { SignupHeroArt } from "../components/SignupHeroArt";
import { SignupIcon } from "../components/SignupIcons";

export const metadata: Metadata = { title: "Sign up | GameDay Huddle", description: "Create a GameDay Huddle coach account and set up your team. Organization plans are arranged with us directly." };

// Three claims, and each one is something the app does rather than something a
// sign-up page would like to be true. There is no count of coaches here on
// purpose: nobody is running it in a real season yet, and a number we cannot
// stand behind is the one thing on this page a coach could catch us on.
const MARKS = [
  { icon: "people", title: "Built for coaches", body: "Everything the staff needs, in one app" },
  { icon: "play", title: "Game day ready", body: "Call plays and record every snap" },
  { icon: "shield", title: "Secure and private", body: "Your team's data stays yours" },
] as const;

export default function SignupPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="signup-hero">
      <SignupHeroArt />
      <div className="signup-hero-copy section-shell">
        <p className="section-kicker">Create your account</p>
        <h1>Get your team<br />on the <em>same page.</em></h1>
        <p className="signup-hero-deck">One account carries your playbook, your roster, your season, and every snap you record. Set it up here, then sign in on the tablet you coach from.</p>
        <ul className="signup-marks">
          {MARKS.map((mark) => (
            <li key={mark.title}>
              <span className="signup-badge"><SignupIcon name={mark.icon} /></span>
              <span><b>{mark.title}</b><small>{mark.body}</small></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
    <section className="signup-section section-shell">
      <SignupFlow />
      {/* Spending a code AFTER you already have an account has no door anywhere:
          the server only ever redeems an invite inside sign-up, there is no
          redemption route to call, and the app's season-over screen offers a
          sign-out and nothing else. So this block says the true thing — write to
          us — instead of naming a form that would have to be built here and on
          the server first. Build that door and this block becomes it. */}
      <div className="signup-returning" id="returning">
        <span className="signup-badge signup-badge-ball"><SignupIcon name="football" /></span>
        <div>
          <span className="section-kicker">Already have an account</span>
          <h2>A new season&apos;s code comes through us.</h2>
          <p>A coach code belongs to one season. When your head coach starts the next one, last season&apos;s code stops working and the app tells you the season is over. There is nowhere to type the new one yet &mdash; not in the app, not on this page &mdash; and signing up again is refused, because your email already has an account.</p>
        </div>
        <p className="signup-returning-note">So send the code to us instead: <a href="/contact">tell us your email and the new code</a> and we will put you back on your head coach&apos;s team. Same account, same email, new season.</p>
      </div>
      <p className="signup-footnote">Running a multi-team program? The Organization plan covers up to 10 teams for five months &mdash; <a href="/contact?topic=organization">tell us about your program</a>, or <a href="/download">download the app</a> to see it before you commit.</p>
    </section>
  </main><MarketingFooter /></div>;
}
