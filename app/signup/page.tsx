import type { Metadata } from "next";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import { SignupFlow } from "../components/SignupFlow";

export const metadata: Metadata = { title: "Sign up | GameDay Huddle", description: "Create a GameDay Huddle coach account and set up your team. Organization plans are arranged with us directly." };

export default function SignupPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="subpage-hero section-shell"><p className="section-kicker">Create your account</p><h1>Two ways to run <em>your program.</em></h1><p>A coach signs up here and starts right away. A youth club or league gets its plan set up with us, so every team lands under one subscription.</p></section>
    <section className="signup-section section-shell">
      <SignupFlow />
      {/* Spending a code AFTER you already have an account has no door anywhere:
          the server only ever redeems an invite inside sign-up, there is no
          redemption route to call, and the app's season-over screen offers a
          sign-out and nothing else. So this block says the true thing — write to
          us — instead of naming a form that would have to be built here and on
          the server first. Build that door and this block becomes it. */}
      <div className="signup-returning" id="returning">
        <span className="section-kicker">Already have an account</span>
        <h2>A new season&apos;s code comes through us.</h2>
        <p>A coach code belongs to one season. When your head coach starts the next one, last season&apos;s code stops working and the app tells you the season is over. There is nowhere to type the new one yet &mdash; not in the app, not on this page &mdash; and signing up again is refused, because your email already has an account.</p>
        <p className="signup-returning-note">So send the code to us instead: <a href="/contact">tell us your email and the new code</a> and we will put you back on your head coach&apos;s team. Same account, same email, new season.</p>
      </div>
      <p className="signup-footnote">Running a multi-team program? The Organization plan covers unlimited teams for a year &mdash; <a href="/contact?topic=organization">tell us about your program</a>, or <a href="/download">download the app</a> to see it before you commit.</p>
    </section>
  </main><MarketingFooter /></div>;
}
