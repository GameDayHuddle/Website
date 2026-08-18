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
      <p className="signup-footnote">Running a multi-team program? The Organization plan covers unlimited teams for a year &mdash; <a href="/contact?topic=organization">tell us about your program</a>, or <a href="/download">download the app</a> to see it before you commit.</p>
    </section>
  </main><MarketingFooter /></div>;
}
