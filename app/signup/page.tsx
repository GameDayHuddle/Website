import type { Metadata } from "next";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingHeader } from "../components/MarketingHeader";
import { SignupFlow } from "../components/SignupFlow";

export const metadata: Metadata = { title: "Sign up | GameDay Huddle", description: "Create a GameDay Huddle account for a single coach or for an entire football organization." };

export default function SignupPage() {
  return <div className="marketing-page"><MarketingHeader /><main>
    <section className="subpage-hero section-shell"><p className="section-kicker">Create your account</p><h1>Two ways to run <em>your program.</em></h1><p>Pick the shape of your account. A single coach runs everything from one sign-in; an organization holds the subscription and invites its coaches onto it.</p></section>
    <section className="signup-section section-shell">
      <SignupFlow />
      <p className="signup-footnote">Running a multi-team program and want to plan the rollout first? <a href="/#organizations">Tell us about your program</a>, or <a href="/download">download the app</a> to see it before you commit.</p>
    </section>
  </main><MarketingFooter /></div>;
}
